"use client";
import React, { useState, useEffect } from "react";
import { fetchSubjects, fetchChapter } from "@/utils/api";
import CommonLoader from "@/commonLoader";
export default function Subject({ onSubjectSelect, onScreenSelection }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingSubjectId, setLoadingSubjectId] = useState(null);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjectsData = await fetchSubjects();
        if (!Array.isArray(subjectsData)) {
          throw new Error("Invalid data format received");
        }

        // Fetch chapter counts for each subject
        const subjectsWithChapters = await Promise.all(
          subjectsData.map(async (subject) => {
            try {
              const chapters = await fetchChapter(subject.id);
              return {
                ...subject,
                chapterCount: Array.isArray(chapters) ? chapters.length : 0,
              };
            } catch {
              return { ...subject, chapterCount: "0" };
            }
          })
        );

        // Sort subjects: 11th before 12th, and then Physics > Chemistry > Biology within each class
        const sortedSubjects = subjectsWithChapters.sort((a, b) => {
          const isA11th = a.name.includes("11th");
          const isB11th = b.name.includes("11th");

          // If they're in different classes, sort by class (11th first)
          if (isA11th !== isB11th) {
            return isA11th ? -1 : 1;
          }

          // If they're in the same class, sort by subject
          const subjectOrder = { Biology: 1, Physics: 2, Chemistry: 3 };
          const getSubjectRank = (name) => {
            if (name.includes("Biology")) return subjectOrder.Biology;
            if (name.includes("Physics")) return subjectOrder.Physics;
            if (name.includes("Chemistry")) return subjectOrder.Chemistry;
            return 4; // for any other subjects
          };

          return getSubjectRank(a.name) - getSubjectRank(b.name);
        });

        setSubjects(sortedSubjects);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setError("Unable to load subjects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  const handleSubjectClick = (subject) => {
    setLoadingSubjectId(subject.id);
    setTimeout(() => {
      onSubjectSelect(subject);
      onScreenSelection("chapter");
      setLoadingSubjectId(null);
    }, 1000);
  };

  const subjectStyles = {
    "11th Biology": {
      image: "/images/practice/11th-biology.png",
      bgColor: "bg-[#32CD32]",
      buttonTextColor: "text-[#248C24]",
    },
    "11th Physics": {
      image: "/images/practice/11th-physics.png",
      bgColor: "bg-[#B57170]",
      buttonTextColor: "text-[#8C5756]",
    },
    "11th Chemistry": {
      image: "/images/practice/11th-chemistry.png",
      bgColor: "bg-[#E1AD01]",
      buttonTextColor: "text-[#9B8108]",
    },
    "12th Biology": {
      image: "/images/practice/12th-biology.png",
      bgColor: "bg-[#00A86B]",
      buttonTextColor: "text-[#088356]",
    },
    "12th Physics": {
      image: "/images/practice/12th-physics.png",
      bgColor: "bg-[#967969]",
      buttonTextColor: "text-[#7D6659]",
    },
    "12th Chemistry": {
      image: "/images/practice/12th-chemistry.png",
      bgColor: "bg-[#CDC50A]",
      buttonTextColor: "text-[#999308]",
    },
  };

  return (
    <div className="p-4">
      {loading && <CommonLoader />}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && (
        <div className="subject_cards">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className={`subject_card ${
                subjectStyles[subject.name]?.bgColor || "bg-gray-200"
              }`}
            >
              <div className="subject-card-inner">
                <div>
                  <h2>{subject.name}</h2>
                  <p className="text-sm text-white">
                    {subject.chapterCount} Chapters
                  </p>
                </div>
                <div>
                  <img
                    src={
                      subjectStyles[subject.name]?.image ||
                      "/images/practice/default.png"
                    }
                    alt={subject.name}
                  />
                </div>
              </div>

              <button
                disabled={loadingSubjectId === subject.id}
                onClick={() => handleSubjectClick(subject)}
                className={`mt-4 px-4 py-2 rounded-full font-semibold bg-white ${
                  subjectStyles[subject.name]?.buttonTextColor || "text-black"
                } transition-transform duration-100 ease-in-out hover:-translate-y-[2px]`}
              >
                {loadingSubjectId === subject.id ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 inline-block mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      style={{
                        color:
                          subjectStyles[subject.name]?.buttonTextColor.replace(
                            "text-",
                            ""
                          ) || "#000",
                      }}
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Attempt By Chapter"
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
