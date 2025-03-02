"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PageFlip } from "page-flip";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// ✅ Set worker source manually
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const PdfFlipbook = () => {
    const flipBookRef = useRef(null);
    const flipInstance = useRef(null);
    const [numPages, setNumPages] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const pdfFile = "/pdf/physics.pdf";

    useEffect(() => {
        if (flipBookRef.current && numPages && !flipInstance.current) {
            flipInstance.current = new PageFlip(flipBookRef.current, {
                width: window.innerWidth * 0.8,
                height: window.innerHeight * 0.9,
                size: "stretch",
                minWidth: 1000,
                maxWidth: 1200,
                minHeight: 500,
                maxHeight: 1400,
                showCover: true,
                mobileScrollSupport: true,
                maxShadowOpacity: 0.6,
                animationDuration: 700, // Smooth transition
            });

            setTimeout(() => {
                if (flipInstance.current) {
                    flipInstance.current.loadFromHTML(document.querySelectorAll(".pdf-page"));
                    setIsLoading(false);
                }
            }, 300); // Small delay to ensure DOM is ready
        }

        return () => {
            if (flipInstance.current) {
                flipInstance.current.destroy();
                flipInstance.current = null;
            }
        };
    }, [numPages]);

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5 }} 
                className="w-full h-full flex flex-col justify-center items-center"
            >
                <h2 className="text-3xl font-bold text-white mb-6">📖 NEET Mock Test</h2>

                {isLoading && (
                    <div className="absolute flex justify-center items-center w-full h-full bg-black bg-opacity-50 z-10">
                        <Loader2 className="w-16 h-16 animate-spin text-white" />
                    </div>
                )}

                <div ref={flipBookRef} className="page-container w-full h-full">
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
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Page pageNumber={index + 1} width={window.innerWidth * 0.8} />
                                </motion.div>
                            </div>
                        ))}
                    </Document>
                </div>
            </motion.div>
        </div>
    );
};

export default PdfFlipbook;
