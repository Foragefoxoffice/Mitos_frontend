"use client";
import { useState, useRef, useEffect } from "react";

const ImagePopup = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState(null);
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);

  const calculateInitialZoom = (imgWidth, imgHeight, containerWidth, containerHeight) => {
    const widthRatio = containerWidth / imgWidth;
    const heightRatio = containerHeight / imgHeight;
    return Math.min(widthRatio, heightRatio, 1);
  };

  const centerPosition = (imgWidth, imgHeight, scale, containerWidth, containerHeight) => {
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    return {
      x: (containerWidth - scaledWidth) / 2,
      y: (containerHeight - scaledHeight) / 2,
    };
  };

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      setImageSize({ width: naturalWidth, height: naturalHeight });

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight - 48;
      const initialScale = calculateInitialZoom(naturalWidth, naturalHeight, containerWidth, containerHeight);

      setScale(initialScale);
      setPosition(centerPosition(naturalWidth, naturalHeight, initialScale, containerWidth, containerHeight));
    };

    const handleResize = () => {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const newScale = calculateInitialZoom(imageSize.width, imageSize.height, width, height - 48);
      setScale(newScale);
      setPosition(centerPosition(imageSize.width, imageSize.height, newScale, width, height - 48));
    };

    window.addEventListener("resize", handleResize);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, [src]);

  const constrainPosition = (x, y, scaleOverride = null) => {
    const s = scaleOverride || scale;
    const container = containerRef.current;
    const maxX = 0;
    const maxY = 0;
    const minX = Math.min(container.clientWidth - imageSize.width * s, 0);
    const minY = Math.min(container.clientHeight - 48 - imageSize.height * s, 0);
    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  };

  const handleWheel = (e) => {
  e.preventDefault();
  const container = containerRef.current;
  if (!container) return;

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight - 48;

  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  const delta = -e.deltaY;
  const zoomFactor = delta > 0 ? 1.1 : 0.9;
  const newScale = Math.max(0.1, Math.min(scale * zoomFactor, 10));

  const imageCenterX = position.x + (imageSize.width * scale) / 2;
  const imageCenterY = position.y + (imageSize.height * scale) / 2;

  const dx = centerX - imageCenterX;
  const dy = centerY - imageCenterY;

  const newX = position.x + dx - dx * (newScale / scale);
  const newY = position.y + dy - dy * (newScale / scale);

  setScale(newScale);
  setPosition(constrainPosition(newX, newY, newScale));
};


  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setStartPos({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    } else if (e.touches.length === 2) {
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && startPos) {
      const touch = e.touches[0];
      const newX = touch.clientX - startPos.x;
      const newY = touch.clientY - startPos.y;
      setPosition(constrainPosition(newX, newY));
    } else if (e.touches.length === 2) {
      const newDist = getTouchDistance(e.touches);
      if (lastTouchDistance) {
        const zoomFactor = newDist / lastTouchDistance;
        const newScale = Math.max(0.1, Math.min(scale * zoomFactor, 10));

        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight - 48;
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        const offsetX = centerX - position.x;
        const offsetY = centerY - position.y;
        const newX = centerX - offsetX * (newScale / scale);
        const newY = centerY - offsetY * (newScale / scale);

        setScale(newScale);
        setPosition(constrainPosition(newX, newY, newScale));
      }
      setLastTouchDistance(newDist);
    }

    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setStartPos(null);
    setLastTouchDistance(null);
  };

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const resetView = () => {
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight - 48;
    const newScale = calculateInitialZoom(imageSize.width, imageSize.height, containerWidth, containerHeight);
    setScale(newScale);
    setPosition(centerPosition(imageSize.width, imageSize.height, newScale, containerWidth, containerHeight));
  };

  const zoomToCenter = (direction) => {
  const container = containerRef.current;
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight - 48;
  const newScale = Math.max(0.1, Math.min(scale + direction * 0.2, 10));

  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  const imageCenterX = position.x + (imageSize.width * scale) / 2;
  const imageCenterY = position.y + (imageSize.height * scale) / 2;

  const dx = centerX - imageCenterX;
  const dy = centerY - imageCenterY;

  const newX = position.x + dx - dx * (newScale / scale);
  const newY = position.y + dy - dy * (newScale / scale);

  setScale(newScale);
  setPosition(constrainPosition(newX, newY, newScale));
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col" ref={containerRef}>
      <div className="flex justify-between items-center p-3 bg-black bg-opacity-70">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => zoomToCenter(1)}
            className="bg-white text-black p-1 rounded w-8 h-8"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => zoomToCenter(-1)}
            className="bg-white text-black p-1 rounded w-8 h-8"
            title="Zoom Out"
          >
            −
          </button>
          <button
            onClick={resetView}
            className="bg-white text-black p-1 rounded w-8 h-8"
            title="Reset"
          >
            ⟲
          </button>
          <div className="text-white px-2 text-sm">{Math.round(scale * 100)}%</div>
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
            alt="Popup"
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable="false"
          />
        </div>
      </div>
    </div>
  );
};

export default ImagePopup;
