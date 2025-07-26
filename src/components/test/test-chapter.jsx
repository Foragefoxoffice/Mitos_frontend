"use client";
import React, { useState, useEffect, useContext } from "react";
import { fetchChaptersBySubject, fetchChapterTopics } from "@/utils/api";
import { TestContext } from "@/contexts/TestContext";
import { useRouter } from "next/navigation";
import CommonLoader from "@/commonLoader";

export default function TestChapter({selectedPortion, selectedSubject, onChapterSelect, onScreenSelection }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setTestData } = useContext(TestContext);
  const router = useRouter();
  console.log("subjectId",selectedPortion)
  useEffect(() => {
    const loadChapters = async () => {
      try {
        const chaptersData = await fetchChaptersBySubject(selectedSubject.id);
        if (!Array.isArray(chaptersData)) {
          throw new Error("Invalid data format received");
        }

        const chaptersWithDetails = await Promise.all(
          chaptersData.map(async (chapter) => {
            try {
              const details = await fetchChapterTopics(chapter.id);
              return { ...chapter, detailCount: Array.isArray(details) ? details.length : 0 };
            } catch {
              return { ...chapter, detailCount: 0 }; // Use 0 instead of "No" for consistency
            }
          })
        );

        setChapters(chaptersWithDetails);
      } catch (err) {
        console.error("Failed to fetch chapters:", err);
        setError("Unable to load chapters. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (selectedSubject) {
      loadChapters();
    }
  }, [selectedSubject]);

  const handleChapterClick = (chapter) => {
    const fullPortionTestData = {
      testname: "Chapter-full-test",
      portionId: selectedPortion.id,
      subjectId: selectedSubject.id,
      chapterId: chapter.id,
    };
    setTestData(fullPortionTestData); // Set the full portion test data in context
    router.push("/user/test");
  };

  const handleCustomTopicsClick = (chapter) => {
    onChapterSelect(chapter);
    onScreenSelection("test-topic");
  };

  return (
    <div className="py-6">
      {loading &&  <CommonLoader />}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && (
        <div className="portion_cards">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="portion_card">
              <h2>{chapter.name} Portion </h2>
              <p className="text-sm text-gray-700">{chapter.detailCount} Topics</p>

              <div className="btns_group">
                <button onClick={() => handleCustomTopicsClick(chapter)}>
                  Customize Chapter Test
                </button>
                <button onClick={() => handleChapterClick(chapter)}>
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