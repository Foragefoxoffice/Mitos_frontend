"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { RotateCw, Maximize, Minimize, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { HiViewBoards, HiViewList } from "react-icons/hi";
import * as pdfjsLib from "pdfjs-dist";
import { useMediaQuery } from "react-responsive";
import { useSelectedTopics } from "@/contexts/SelectedTopicsContext";
import { fetchQuestionByTopic } from "@/utils/api";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const API_BASE_URL = "https://mitoslearning.in/api";
const PDF_BASE_URL = "https://mitoslearning.in";

// Canvas cache to store rendered pages
const canvasCache = new Map();

// Device Pixel Ratio (cap at 2.5 to avoid huge bitmaps)
const DPR = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2.5) : 1;

const PdfViewerComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfTitle, setPdfTitle] = useState("Document");
  const [pagesPerView, setPagesPerView] = useState(1); // 1 or 2
  const [questionCount, setQuestionCount] = useState(null);

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topicId");
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const router = useRouter();
  const { setSelectedTopics } = useSelectedTopics();

  // Set initial pages per view based on device
  useEffect(() => {
    setPagesPerView(isMobile ? 1 : 2);
  }, [isMobile]);

  // Handle navigation to practice page
  const handlePracticeNavigation = () => {
    if (topicId) {
      setSelectedTopics([topicId]);
      router.push("/user/practice");
    }
  };

  // Fetch PDF URL based on topicId
  useEffect(() => {
    if (!topicId) {
      setError("No topicId provided in URL");
      setIsLoading(false);
      return;
    }

    const fetchPdfUrl = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/pdf/topic/${topicId}`);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (!data || data.length === 0 || !data[0].url) {
          throw new Error("No PDF found for this topic");
        }

        const fullPdfUrl = `${PDF_BASE_URL}${data[0].url}`;
        setPdfUrl(fullPdfUrl);
        setPdfTitle(data[0].name || "Document");

        const pdf = await pdfjsLib.getDocument({
          url: fullPdfUrl,
          cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        }).promise;

        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching PDF:", err);
        setError(err.message || "Failed to load PDF document");
        setIsLoading(false);
      }
    };

    fetchPdfUrl();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [topicId]);

  useEffect(() => {
    if (!topicId) {
      setQuestionCount(0);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const res = await fetchQuestionByTopic(topicId);

        let count = 0;
        if (Array.isArray(res)) count = res.length;
        else if (Array.isArray(res?.questions)) count = res.questions.length;
        else if (typeof res?.total === "number") count = res.total;
        else if (typeof res?.count === "number") count = res.count;
        else if (Array.isArray(res?.data)) count = res.data.length;

        if (!cancelled) setQuestionCount(Number.isFinite(count) ? count : 0);
      } catch {
        if (!cancelled) setQuestionCount(0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [topicId]);

  // -------- High-quality rendering helpers --------

  // compute available inner width of the container (minus paddings)
  const getContainerInnerWidth = () => {
    const el = containerRef.current;
    if (!el) return window.innerWidth;
    const cs = typeof window !== "undefined" ? window.getComputedStyle(el) : null;
    const padL = cs ? parseFloat(cs.paddingLeft) || 0 : 0;
    const padR = cs ? parseFloat(cs.paddingRight) || 0 : 0;
    return el.clientWidth - padL - padR;
  };

  // Decide viewport (CSS-fit) and outputScale (DPR) for a page
  const computeViewportForPage = (page) => {
    const base = page.getViewport({ scale: 1 });

    const containerW = getContainerInnerWidth();
    const gap = !isMobile && pagesPerView === 2 ? 16 : 0; // Tailwind gap-4 = 16px
    const onePageCssWidth = pagesPerView === 2 ? Math.max(280, (containerW - gap) / 2) : containerW;

    // fit-by-width scale; ensure at least 1x to avoid tiny bitmaps on very small containers
    const cssScale = Math.max(1, onePageCssWidth / base.width);

    // Real pixel buffer scale (cap already in DPR)
    const outputScale = DPR;

    const viewport = page.getViewport({ scale: cssScale });
    return { viewport, cssScale, outputScale };
  };

  // Render page to canvas at DPR for crisp quality
  const renderPage = useCallback(
    async (pageNum, canvas) => {
      if (!pdfDocument || pageNum < 1 || pageNum > numPages || !canvas) return;

      try {
        const page = await pdfDocument.getPage(pageNum);
        const { viewport, cssScale, outputScale } = computeViewportForPage(page);

        const cacheKey = `${pdfUrl}-${pageNum}-s${cssScale.toFixed(3)}-d${outputScale}`;
        if (canvasCache.has(cacheKey)) {
          const cached = canvasCache.get(cacheKey);
          canvas.width = cached.width;
          canvas.height = cached.height;
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          canvas.getContext("2d").drawImage(cached, 0, 0);
          return;
        }

        const ctx = canvas.getContext("2d");

        // CSS (logical) size
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        // Real pixel buffer at DPR (retina)
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);

        await page
          .render({
            canvasContext: ctx,
            viewport,
            transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null,
          })
          .promise;

        // Cache
        const off = document.createElement("canvas");
        off.width = canvas.width;
        off.height = canvas.height;
        off.getContext("2d").drawImage(canvas, 0, 0);
        canvasCache.set(cacheKey, off);

        // Preload neighbors at same quality
        if (pageNum < numPages) preloadPage(pageNum + 1);
        if (pageNum > 1) preloadPage(pageNum - 1);
      } catch (err) {
        console.error("Error rendering page:", err);
      }
    },
    [pdfDocument, numPages, pdfUrl, pagesPerView, isMobile]
  );

  // Preload page into cache at proper scale/DPR
  const preloadPage = useCallback(
    async (pageNum) => {
      if (!pdfDocument || pageNum < 1 || pageNum > numPages) return;
      try {
        const page = await pdfDocument.getPage(pageNum);
        const { viewport, cssScale, outputScale } = computeViewportForPage(page);

        const cacheKey = `${pdfUrl}-${pageNum}-s${cssScale.toFixed(3)}-d${outputScale}`;
        if (canvasCache.has(cacheKey)) return;

        const temp = document.createElement("canvas");
        temp.width = Math.floor(viewport.width * outputScale);
        temp.height = Math.floor(viewport.height * outputScale);

        await page
          .render({
            canvasContext: temp.getContext("2d"),
            viewport,
            transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null,
          })
          .promise;

        canvasCache.set(cacheKey, temp);
      } catch (err) {
        console.error("Error preloading page:", err);
      }
    },
    [pdfDocument, numPages, pdfUrl, pagesPerView, isMobile]
  );

  // Handle page changes
  const goToPage = useCallback(
    (newPage) => {
      if (newPage < 1 || newPage > numPages) return;
      animationFrameRef.current = requestAnimationFrame(() => {
        setCurrentPage(newPage);
      });
    },
    [numPages]
  );

  const goToNextPage = useCallback(() => {
    const increment = pagesPerView === 1 ? 1 : 2;
    goToPage(Math.min(currentPage + increment, numPages));
  }, [currentPage, numPages, pagesPerView, goToPage]);

  const goToPrevPage = useCallback(() => {
    const decrement = pagesPerView === 1 ? 1 : 2;
    goToPage(Math.max(currentPage - decrement, 1));
  }, [currentPage, pagesPerView, goToPage]);

  // Touch swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = 0;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const deltaX = touchStartX.current - touchEndX.current;
    const absDeltaX = Math.abs(deltaX);
    if (absDeltaX < 50) return;
    if (deltaX > 0 && currentPage < numPages) goToNextPage();
    else if (deltaX < 0 && currentPage > 1) goToPrevPage();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          goToPrevPage();
          break;
        case "ArrowRight":
          goToNextPage();
          break;
        case "Home":
          goToPage(1);
          break;
        case "End":
          goToPage(numPages);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextPage, goToPrevPage, goToPage, numPages]);

  // Render current pages
  useEffect(() => {
    if (!pdfDocument) return;
    const container = containerRef.current;
    if (!container) return;

    const canvas1 = container.querySelector("#page1");
    const canvas2 = container.querySelector("#page2");

    if (canvas1) renderPage(currentPage, canvas1);
    if (pagesPerView === 2 && currentPage < numPages && canvas2) {
      renderPage(currentPage + 1, canvas2);
    }
  }, [currentPage, pdfDocument, pagesPerView, numPages, renderPage]);

  // Resize / orientation / fullscreen / layout changes -> clear cache and re-render at new size
  useEffect(() => {
    const onResize = () => {
      canvasCache.clear();
      setCurrentPage((p) => p); // trigger re-render
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  useEffect(() => {
    canvasCache.clear();
    setCurrentPage((p) => p);
  }, [pagesPerView, isFullscreen, isMobile]);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Toggle between 1 and 2 pages per view
  const togglePagesPerView = () => {
    setPagesPerView((prev) => (prev === 1 ? 2 : 1));
  };

  // Sync state if user exits fullscreen via ESC/system
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <RotateCw className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="mt-4 text-lg">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-4">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Materials</h2>
          <p className="text-gray-600 mb-6">
            We encountered an error while loading the materials. Please try again later.
          </p>
          <a href="/user/dashboard" className="btn m-auto">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full ${
        isFullscreen ? "fixed inset-0 bg-black z-50 overflow-y-scroll" : "min-h-screen bg-gray-100"
      }`}
    >
      {/* Header */}
      <div className={`bg-white shadow-md ${isFullscreen ? "fixed top-0 left-0 right-0 z-50" : ""}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold truncate max-w-xs md:max-w-md">{pdfTitle}</h1>
            <span className="text-sm text-gray-500">
              Page {currentPage}-{Math.min(currentPage + pagesPerView - 1, numPages)} of {numPages}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Page navigation controls (desktop) */}
            <div className="hidden md:flex items-center space-x-2">
              {questionCount > 1 && (
                <div className="flex justify-center">
                  <button
                    onClick={handlePracticeNavigation}
                    className="bg-[#35095e] hover:bg-[#35095e]/90 text-white font-medium py-2 px-6 rounded-full shadow-lg transition-colors"
                  >
                    Practice This Topic
                  </button>
                </div>
              )}
              <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="px-2 py-1 text-sm rounded disabled:opacity-50">
                First
              </button>
              <button onClick={goToPrevPage} disabled={currentPage === 1} className="p-1 rounded-full disabled:opacity-50">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={goToNextPage} disabled={currentPage >= numPages} className="p-1 rounded-full disabled:opacity-50">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button onClick={() => goToPage(numPages)} disabled={currentPage === numPages} className="px-2 py-1 text-sm rounded disabled:opacity-50">
                Last
              </button>
            </div>

            {/* Pages per view toggle (not mobile) */}
            {!isMobile && (
              <div
                onClick={togglePagesPerView}
                className="relative inline-flex items-center cursor-pointer bg-gray-100 dark:bg-[#35095e] p-1 rounded-full transition-all duration-300 w-32 shadow-md hover:shadow-lg"
              >
                <span
                  className={`absolute top-1 left-1 h-5 w-14 rounded-full bg-white shadow transform transition-transform duration-300 ${
                    pagesPerView === 2 ? "translate-x-16" : ""
                  }`}
                ></span>
                <div className="z-10 w-1/2 flex items-center justify-center space-x-1">
                  <HiViewList className={`text-lg transition-colors duration-300 ${pagesPerView === 1 ? "text-[#35095e]" : "text-white"}`} />
                  <span className={`text-sm font-medium transition-colors duration-300 ${pagesPerView === 1 ? "text-[#35095e]" : "text-white"}`}>1</span>
                </div>
                <div className="z-10 w-1/2 flex items-center justify-center space-x-1">
                  <HiViewBoards className={`text-lg transition-colors duration-300 ${pagesPerView === 2 ? "text-[#35095e]" : "text-white"}`} />
                  <span className={`text-sm font-medium transition-colors duration-300 ${pagesPerView === 2 ? "text-[#35095e]" : "text-white"}`}>2</span>
                </div>
              </div>
            )}

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-[#35095e]/90"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* PDF container */}
      <div
        ref={containerRef}
        className={`pdf-container w-full ${isFullscreen ? "mt-14" : ""} flex items-center justify-center p-4 ${
          isMobile ? "overflow-hidden" : "overflow-auto"
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`relative ${isMobile ? "w-full h-full" : "flex gap-4"} bg-gray-200`}>
          {/* First Page */}
          <div className={`relative ${isMobile ? "w-full h-full" : "flex-1"}`}>
            <canvas id="page1" className="block" />
          </div>

          {/* Second Page (when pagesPerView is 2) */}
          {pagesPerView === 2 && currentPage < numPages && (
            <div className="flex-1 relative">
              <canvas id="page2" className="block" />
            </div>
          )}

          {/* Mobile navigation arrows */}
          {isMobile && (
            <>
              {currentPage > 1 && (
                <button
                  onClick={goToPrevPage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 z-20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {currentPage < numPages && (
                <button
                  onClick={goToNextPage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 z-20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapper component with Suspense boundary
export default function PdfViewer() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center">
            <RotateCw className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="mt-4 text-lg">Loading document...</p>
          </div>
        </div>
      }
    >
      <PdfViewerComponent />
    </Suspense>
  );
}
