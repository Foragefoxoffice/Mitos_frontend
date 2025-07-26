"use client";
import React, { useState, useEffect } from "react";
import { fetchSubjects, fetchChapter } from "@/utils/api";
import CommonLoader from "@/commonLoader";
export default function MeterialsSubject({ onSubjectSelect, onScreenSelection }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjectsData = await fetchSubjects();
        if (!Array.isArray(subjectsData)) {
          throw new Error("Invalid data format received");
        }

        const subjectsWithChapters = await Promise.all(
          subjectsData.map(async (subject) => {
            try {
              const chapters = await fetchChapter(subject.id);
              return { ...subject, chapterCount: Array.isArray(chapters) ? chapters.length : 0 };
            } catch {
              return { ...subject, chapterCount: "0" };
            }
          })
        );

        const sortedSubjects = subjectsWithChapters.sort((a, b) => {
          const isA11th = a.name.includes("11th");
          const isB11th = b.name.includes("11th");

          if (isA11th === isB11th) {
            return a.name.localeCompare(b.name);
          }

          return isA11th ? -1 : 1;
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
    onSubjectSelect(subject);
    onScreenSelection("chapter");
  };

  return (
    <div className="p-4">
      {loading &&  <CommonLoader />}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && (
        <div className="subject_cards grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {subjects.map((subject) => (
            <div key={subject.id} className="subject_card p-4 border rounded-lg shadow hover:shadow-md transition">
              <h2 className="text-lg font-semibold">{subject.name}</h2>
              <p className="text-sm text-gray-700 mb-2">{subject.chapterCount} Chapters</p>
              <a
                onClick={() => handleSubjectClick(subject)}
                className="text-blue-600  cursor-pointer "
              >
                Learn by Chapter
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
