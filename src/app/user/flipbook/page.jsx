"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PageFlip } from "page-flip";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { Loader2, ChevronLeft, ChevronRight, Maximize, Minimize, ZoomIn, ZoomOut } from "lucide-react";

// Set PDF worker source
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const PdfFlipbook = () => {
    const flipBookRef = useRef(null);
    const flipInstance = useRef(null);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const pdfFile = "/pdf/physics.pdf";

    // Detect screen size & toggle dual-page mode
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Initialize Flipbook
    useEffect(() => {
        if (flipBookRef.current && numPages > 0) {
            if (!flipInstance.current) {
                flipInstance.current = new PageFlip(flipBookRef.current, {
                    width: isMobile ? 350 : 700,
                    height: isMobile ? 500 : 900,
                    size: "stretch",
                    maxShadowOpacity: 0.2,
                    showCover: false,
                    mobileScrollSupport: true,
                    swipeDistance: 30,
                    useMouseEvents: true,
                    autoSize: true,
                    startPage: 0,
                    singlePage: isMobile,
                });

                flipInstance.current.on("flip", (e) => {
                    setCurrentPage(e.data);
                });

                flipInstance.current.loadFromHTML(document.querySelectorAll(".pdf-page"));
                setIsLoading(false);
            }
        }

        return () => {
            if (flipInstance.current) {
                flipInstance.current.destroy();
                flipInstance.current = null;
            }
        };
    }, [numPages, isMobile]);

    // Fullscreen toggle
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // Navigation functions
    const goToPrevPage = () => {
        if (flipInstance.current) flipInstance.current.flipPrev();
    };

    const goToNextPage = () => {
        if (flipInstance.current) flipInstance.current.flipNext();
    };

    // Zoom controls (affects individual pages)
    const zoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2));
    const zoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            flipBookRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
            setZoom(1); // Reset zoom when exiting fullscreen
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowLeft") goToPrevPage();
            if (e.key === "ArrowRight") goToNextPage();
            if (e.key === "+") zoomIn();
            if (e.key === "-") zoomOut();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentPage, numPages]);

    return (
        <div className={`w-screen h-screen flex flex-col justify-center items-center bg-gray-100 ${isFullscreen ? "fixed inset-0 bg-black" : ""}`}>
            {/* Header */}
            {!isFullscreen && (
                <div className="absolute top-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-900">📖 NEET Mock Test Flipbook</h2>
                </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute flex justify-center items-center w-full h-full bg-black bg-opacity-50 z-10">
                    <Loader2 className="w-16 h-16 animate-spin text-white" />
                </div>
            )}

            {/* Flipbook Container */}
            <div
                ref={flipBookRef}
                className="relative border border-gray-400 shadow-lg bg-white rounded-lg overflow-hidden"
                style={{
                    width: isFullscreen ? "100vw" : isMobile ? "90vw" : "85vw",
                    height: isFullscreen ? "100vh" : "90vh",
                }}
            >
                <Document
                    file={pdfFile}
                    onLoadSuccess={({ numPages }) => {
                        setNumPages(numPages);
                        setIsLoading(false);
                    }}
                    loading={
                        <div className="absolute flex justify-center items-center w-full h-full bg-black bg-opacity-50 z-10">
                            <Loader2 className="w-16 h-16 animate-spin text-white" />
                        </div>
                    }
                >
                    {Array.from({ length: numPages || 0 }, (_, index) => (
                        <div key={index} className="pdf-page">
                            <div className="p-2 bg-white shadow-md border border-gray-300">
                                {isMobile ? (
                                    <Page pageNumber={index + 1} scale={zoom} />
                                ) : (
                                    <div className="flex gap-2">
                                        <Page pageNumber={index + 1} scale={zoom} />
                                        {index + 2 <= numPages && <Page pageNumber={index + 2} scale={zoom} />}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </Document>
            </div>

            {/* Navigation & Controls */}
            <div className="absolute bottom-4 flex items-center gap-4">
                <button onClick={goToPrevPage} disabled={currentPage === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg" aria-label="Previous Page">
                    <ChevronLeft /> Prev
                </button>

                <button onClick={toggleFullscreen} className="px-4 py-2 bg-gray-600 text-white rounded-lg" aria-label="Toggle Fullscreen">
                    {isFullscreen ? <Minimize /> : <Maximize />}
                </button>

                <button onClick={zoomIn} className="px-4 py-2 bg-green-600 text-white rounded-lg" aria-label="Zoom In">
                    <ZoomIn />
                </button>

                <button onClick={zoomOut} className="px-4 py-2 bg-red-600 text-white rounded-lg" aria-label="Zoom Out">
                    <ZoomOut />
                </button>

                <button onClick={goToNextPage} disabled={currentPage >= numPages - 1} className="px-4 py-2 bg-blue-600 text-white rounded-lg" aria-label="Next Page">
                    Next <ChevronRight />
                </button>
            </div>
        </div>
    );
};

export default PdfFlipbook;
