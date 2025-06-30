"use client";
import { useState, useRef, useEffect } from "react";

const ImagePopup = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });

      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight - 48;

        const widthRatio = containerWidth / img.naturalWidth;
        const heightRatio = containerHeight / img.naturalHeight;
        const initialScale = Math.min(widthRatio, heightRatio, 1);
        setScale(initialScale);
        setPosition({ x: 0, y: 0 });
      }
    };

    const updateContainerSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight - 48
        });
      }
    };

    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    document.body.style.overflow = "hidden"; // Prevent background scroll

    return () => {
      window.removeEventListener("resize", updateContainerSize);
      document.body.style.overflow = ""; // Restore scroll
    };
  }, [src]);

  const getBoundaries = () => {
    if (!imageSize.width || !imageSize.height || !containerSize.width || !containerSize.height) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const scaledWidth = imageSize.width * scale;
    const scaledHeight = imageSize.height * scale;

    return {
      minX: Math.min(containerSize.width - scaledWidth, 0),
      maxX: 0,
      minY: Math.min(containerSize.height - scaledHeight, 0),
      maxY: 0
    };
  };

  const constrainPosition = (x, y) => {
    const { minX, maxX, minY, maxY } = getBoundaries();
    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y))
    };
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const zoomFactor = delta > 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.1, Math.min(scale * zoomFactor, 10));

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - position.x) * (newScale / scale);
    const newY = mouseY - (mouseY - position.y) * (newScale / scale);

    setScale(newScale);
    setPosition(constrainPosition(newX, newY));
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;
    setPosition(constrainPosition(newX, newY));
    e.preventDefault();
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    if (!containerRef.current || !imageSize.width) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight - 48;

    const widthRatio = containerWidth / imageSize.width;
    const heightRatio = containerHeight / imageSize.height;
    const newScale = Math.min(widthRatio, heightRatio, 1);

    setScale(newScale);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col" ref={containerRef}>
      <div className="flex justify-between items-center p-3 bg-black bg-opacity-70">
        <div className="flex gap-2">
          <button
            onClick={() => setScale((prev) => Math.min(prev + 0.2, 10))}
            className="bg-white text-black p-1 rounded w-8 h-8 flex items-center justify-center"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setScale((prev) => Math.max(prev - 0.2, 0.1))}
            className="bg-white text-black p-1 rounded w-8 h-8 flex items-center justify-center"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={resetView}
            className="bg-white text-black p-1 rounded w-8 h-8 flex items-center justify-center"
            title="Reset View"
          >
            ⟲
          </button>
          <div className="text-white px-2 flex items-center text-sm">
            {Math.round(scale * 100)}%
          </div>
        </div>
        <button
          onClick={onClose}
          className="bg-white text-black p-1 rounded w-8 h-8 flex items-center justify-center"
          title="Close"
        >
          ×
        </button>
      </div>

      <div
        className="flex-1 overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
      >
        <div
          ref={contentRef}
          className="absolute"
          style={{
            width: `${imageSize.width * scale}px`,
            height: `${imageSize.height * scale}px`,
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? "none" : "transform 0.2s ease"
          }}
        >
          <img
            ref={imgRef}
            src={src}
            alt="Zoomed"
            className="w-full h-full object-contain"
            draggable="false"
          />
        </div>
      </div>
    </div>
  );
};

export default ImagePopup;
