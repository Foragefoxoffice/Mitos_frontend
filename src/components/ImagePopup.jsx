"use client";
import { useState, useRef, useEffect } from "react";

const ImagePopup = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // Initial load
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

    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight - 48,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", updateSize);
      document.body.style.overflow = "";
    };
  }, [src]);

  const getBoundaries = () => {
    const scaledWidth = imageSize.width * scale;
    const scaledHeight = imageSize.height * scale;

    return {
      minX: Math.min(containerSize.width - scaledWidth, 0),
      maxX: 0,
      minY: Math.min(containerSize.height - scaledHeight, 0),
      maxY: 0,
    };
  };

  const constrainPosition = (x, y) => {
    const { minX, maxX, minY, maxY } = getBoundaries();
    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setStartPos({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    } else if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches);
      setLastTouchDistance(dist);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const newX = touch.clientX - startPos.x;
      const newY = touch.clientY - startPos.y;
      setPosition(constrainPosition(newX, newY));
    } else if (e.touches.length === 2) {
      const newDist = getTouchDistance(e.touches);
      if (lastTouchDistance) {
        const zoomFactor = newDist / lastTouchDistance;
        let newScale = Math.max(0.1, Math.min(scale * zoomFactor, 10));
        setScale(newScale);
      }
      setLastTouchDistance(newDist);
    }

    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      setLastTouchDistance(null);
    }
  };

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
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

  const resetView = () => {
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight - 48;

    const widthRatio = containerWidth / imageSize.width;
    const heightRatio = containerHeight / imageSize.height;
    const newScale = Math.min(widthRatio, heightRatio, 1);

    setScale(newScale);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 touch-none bg-black bg-opacity-90 z-50 flex flex-col" ref={containerRef}>
      <div className="flex justify-between items-center p-3 bg-black bg-opacity-70">
        <div className="flex gap-2">
          <button
            onClick={() => setScale((prev) => Math.min(prev + 0.2, 10))}
            className="bg-white text-black p-1 rounded w-8 h-8"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setScale((prev) => Math.max(prev - 0.2, 0.1))}
            className="bg-white text-black p-1 rounded w-8 h-8"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={resetView}
            className="bg-white text-black p-1 rounded w-8 h-8"
            title="Reset"
          >
            ⟲
          </button>
          <div className="text-white px-2 flex items-center text-sm">
            {Math.round(scale * 100)}%
          </div>
        </div>
        <button
          onClick={onClose}
          className="bg-white text-black p-1 rounded w-8 h-8"
          title="Close"
        >
          ×
        </button>
      </div>

      <div
        className="flex-1 overflow-hidden relative"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "none" }}
      >
        <div
          ref={contentRef}
          className="absolute"
          style={{
            width: `${imageSize.width * scale}px`,
            height: `${imageSize.height * scale}px`,
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: "transform 0.1s ease",
          }}
        >
          <img
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
