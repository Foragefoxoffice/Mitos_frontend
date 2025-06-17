"use client";
import React, { useState, useEffect } from "react";
import { fetchSubjects, fetchChapter } from "@/utils/api";

export default function Subject({ onSubjectSelect, onScreenSelection }) {
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

        // Fetch chapter counts for each subject
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

        // Sort subjects: 11th before 12th, and then Physics > Chemistry > Biology within each class
        const sortedSubjects = subjectsWithChapters.sort((a, b) => {
          const isA11th = a.name.includes("11th");
          const isB11th = b.name.includes("11th");
          
          // If they're in different classes, sort by class (11th first)
          if (isA11th !== isB11th) {
            return isA11th ? -1 : 1;
          }
          
          // If they're in the same class, sort by subject
          const subjectOrder = { Biology: 1, Physics: 2, Chemistry: 3};
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
    onSubjectSelect(subject);
    onScreenSelection("chapter");
  };

  return (
    <div className="p-4">
      {loading && <p className="text-gray-500 text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && (
        <div className="subject_cards">
          {subjects.map((subject) => (
            <div key={subject.id} className="subject_card">
              <h2>{subject.name}</h2>
              <p className="text-sm text-gray-700">{subject.chapterCount} Chapters</p>
              <a onClick={() => handleSubjectClick(subject)}>
                Attempt By Chapter
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}