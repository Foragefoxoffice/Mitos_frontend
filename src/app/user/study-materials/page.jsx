"use client";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Fix worker URL issuewo
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.12.174/build/pdf.worker.min.js`; 

const StudyMaterials = () => {
  const materials = [
    { id: 1, title: "Physics Notes", pdf_url: "/pdf/physics.pdf" },
    { id: 2, title: "Chemistry Notes", pdf_url: "/pdfs/chemistry.pdf" },
    { id: 3, title: "Biology Notes", pdf_url: "/pdfs/biology.pdf" },
  ];

  const [selectedPdf, setSelectedPdf] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">📖 Study Materials</h1>

      {/* PDF List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {materials.map((material) => (
          <div key={material.id} className="border rounded-lg p-4 shadow-md bg-white">
            <h2 className="text-lg font-semibold">{material.title}</h2>
            <button
              onClick={() => {
                setSelectedPdf(material.pdf_url);
                setCurrentPage(1); // Reset to first page when opening
              }}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Open PDF 📖
            </button>
          </div>
        ))}
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg w-11/12 h-5/6 relative">
            <button
              onClick={() => setSelectedPdf(null)}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
            >
              ✖ Close
            </button>

            <div className="flex flex-col items-center">
              <Document
                file={selectedPdf}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                className="border shadow-lg p-2"
              >
                <Page pageNumber={currentPage} />
              </Document>

              {/* Navigation Controls */}
              <div className="mt-4 flex justify-between w-full px-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 bg-gray-300 rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"}`}
                >
                  ◀ Previous
                </button>

                <p className="text-lg">
                  Page {currentPage} of {numPages}
                </p>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, numPages))}
                  disabled={currentPage === numPages}
                  className={`px-4 py-2 bg-gray-300 rounded ${currentPage === numPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"}`}
                >
                  Next ▶
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterials;
