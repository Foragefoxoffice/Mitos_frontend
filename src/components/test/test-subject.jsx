"use client";

import React, { useState, useEffect, useContext } from "react";
import { fetchSubjectsByPortions, fetchChaptersBySubject } from "@/utils/api";
import { TestContext } from "@/contexts/TestContext";
import { useRouter } from "next/navigation";

export default function TestSubject({ selectedPortion, onSubjectSelect, onScreenSelection }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setTestData } = useContext(TestContext);
  const router = useRouter();

  useEffect(() => {
    const loadSubjects = async () => {
      if (!selectedPortion) return; // Ensure selectedPortion is valid before fetching

      try {
        const subjectsData = await fetchSubjectsByPortions(selectedPortion.id);
        if (!Array.isArray(subjectsData)) {
          throw new Error("Invalid data format received");
        }

        const subjectsWithDetails = await Promise.all(
          subjectsData.map(async (subject) => {
            try {
              const details = await fetchChaptersBySubject(subject.id);
              return { ...subject, detailCount: Array.isArray(details) ? details.length : 0 };
            } catch {
              return { ...subject, detailCount: 0 };
            }
          })
        );

        setSubjects(subjectsWithDetails);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setError("Unable to load subjects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [selectedPortion]);

  const handlePortionClick = (subject) => {
    const fullPortionTestData = {
      testname: "subject-full-test",
      portionId: selectedPortion.id,
      subjectId: subject.id,
    };
    setTestData(fullPortionTestData);
    router.push("/user/full-test");
  };

  const handleCustomPortionClick = (subject) => {
    onSubjectSelect(subject, selectedPortion); // Pass selectedPortion
    onScreenSelection("test-chapter");
  };
  

  return (
    <div className="py-6">
      {loading && <p className="text-gray-500 text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && (
        <div className="portion_cards">
          {subjects.map((subject) => (
            <div key={subject.id} className="portion_card">
              <h2>{subject.name} Portion</h2>
              <p className="text-sm text-gray-700">{subject.detailCount} Chapters</p>

              <div className="btns_group">
                <button onClick={() => handleCustomPortionClick(subject, selectedPortion)}>
                  Customize Chapter DPP
                </button>
                <button onClick={() => handlePortionClick(subject)}>
                  Full Test
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
