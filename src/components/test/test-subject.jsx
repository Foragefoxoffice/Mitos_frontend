"use client";

import React, { useState, useEffect, useContext } from "react";
import { fetchSubjectsByPortions, fetchChaptersBySubject } from "@/utils/api";
import { TestContext } from "@/contexts/TestContext";
import { useRouter } from "next/navigation";
import { FaAngleDown, FaCircleCheck, FaXmark, FaMinus } from "react-icons/fa6";
import CommonLoader from "@/commonLoader";
export default function TestSubject({ selectedPortion }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [selectedChapters, setSelectedChapters] = useState({});
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [questionLimit, setQuestionLimit] = useState(60);
  const { setTestData } = useContext(TestContext);
  const router = useRouter();

  useEffect(() => {
    const loadSubjects = async () => {
      if (!selectedPortion) return;

      try {
        const subjectsData = await fetchSubjectsByPortions(selectedPortion.id);
        if (!Array.isArray(subjectsData)) {
          throw new Error("Invalid data format received");
        }

        const subjectsWithDetails = await Promise.all(
          subjectsData.map(async (subject) => {
            try {
              const details = await fetchChaptersBySubject(subject.id);
              return {
                ...subject,
                chapters: Array.isArray(details) ? details : [],
              };
            } catch {
              return { ...subject, chapters: [] };
            }
          })
        );

        // Sort subjects by chapter count in descending order
        const sortedSubjects = [...subjectsWithDetails].sort(
          (a, b) => b.chapters.length - a.chapters.length
        );

        setSubjects(sortedSubjects);

        // Set the first subject with chapters as expanded by default
        const firstSubjectWithChapters = sortedSubjects.find(
          (subject) => subject.chapters.length > 0
        );
        if (firstSubjectWithChapters) {
          setExpandedSubjectId(firstSubjectWithChapters.id);
        }
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setError("Unable to load subjects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [selectedPortion]);

  const handleSubjectClick = (subjectId) => {
    setExpandedSubjectId((prev) => (prev === subjectId ? null : subjectId));
  };

  const handleChapterSelect = (subjectId, chapterId, chapterName) => {
    setSelectedChapters((prev) => {
      const subjectChapters = prev[subjectId] || {};
      const updatedChapters = subjectChapters[chapterId]
        ? { ...subjectChapters, [chapterId]: undefined }
        : { ...subjectChapters, [chapterId]: chapterName };

      return { ...prev, [subjectId]: updatedChapters };
    });
  };

  const handleSelectAll = (subjectId, chapters) => {
    setSelectedChapters((prev) => {
      const allSelected = chapters.every((ch) => prev[subjectId]?.[ch.id]);
      const updatedChapters = allSelected
        ? {} // Unselect all
        : Object.fromEntries(chapters.map((ch) => [ch.id, ch.name])); // Select all

      return { ...prev, [subjectId]: updatedChapters };
    });
  };

  const handleStartClick = () => {
    const selectedChapterIds = Object.values(selectedChapters).flatMap(
      (chapters) => Object.keys(chapters).filter((id) => chapters[id])
    );

    if (selectedChapterIds.length === 0) {
      alert("Please select at least one chapter to start the test.");
      return;
    }

    setShowLimitPopup(true);
  };

  const confirmStartTest = () => {
    const selectedChapterIds = Object.values(selectedChapters).flatMap(
      (chapters) => Object.keys(chapters).filter((id) => chapters[id])
    );

    const testData = {
      testname: "custom-test",
      portionId: selectedPortion.id,
      chapterIds: selectedChapterIds,
      questionLimit: questionLimit,
    };

    setTestData(testData);
    router.push("/user/test");
  };

  return (
    <div className="py-6 relative">
      {loading && <CommonLoader />}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Display selected chapters */}
      {Object.keys(selectedChapters).some(
        (subjectId) => Object.keys(selectedChapters[subjectId]).length > 0
      ) && (
        <div className="mb-6 p-5 bg-[#fffafa] rounded-md">
          <h3 className="text-xl text-[#35095e] font-semibold pb-5">
            Selected Chapters:
          </h3>
          <ul className="pl-0 text-gray-700 slected_list">
            {Object.entries(selectedChapters).flatMap(([subjectId, chapters]) =>
              Object.entries(chapters)
                .filter(([, name]) => name)
                .map(([chapterId, name]) => (
                  <li
                    className="group flex items-start gap-2 pb-3 transition-all"
                    key={`${subjectId}-${chapterId}`}
                  >
                    <button
                      onClick={() =>
                        handleChapterSelect(subjectId, chapterId, name)
                      }
                      className="w-5 h-5 rounded-full p-1 bg-[#35095e] flex items-center justify-center transition-all duration-200"
                      title="Remove"
                    >
                      {/* Default icon */}
                      <FaMinus className="text-white transition-opacity duration-200 opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-75" />

                      {/* Hover icon */}
                      <FaXmark className="text-white absolute transition-opacity duration-200 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100" />
                    </button>

                    <span className="flex items-center gap-2">{name}</span>
                  </li>
                ))
            )}
          </ul>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {subjects.map((subject) => {
            const allSelected =
              subject.chapters.length > 0 &&
              subject.chapters.every(
                (ch) => selectedChapters[subject.id]?.[ch.id]
              );

            return (
              <div
                key={subject.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div
                  className={`p-5 cursor-pointer bg-[#fffafa] rounded-lg flex justify-between items-center 
                    ${
                      subject.chapters.length > 0
                        ? "hover:bg-white"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  onClick={() =>
                    subject.chapters.length > 0 &&
                    handleSubjectClick(subject.id)
                  }
                >
                  <h2 className="text-lg font-semibold text-[#35095e]">
                    {subject.name} |{" "}
                    <span>{subject.chapters.length} Chapters</span>
                  </h2>

                  <span className="text-sm text-gray-600 flex items-center">
                    {subject.chapters.length > 0 && (
                      <FaAngleDown
                        className={`ml-2 transition-transform ${
                          expandedSubjectId === subject.id ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </span>
                </div>

                {expandedSubjectId === subject.id && (
                  <div className="p-5 transition-all duration-300 ease-in-out">
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() =>
                          handleSelectAll(subject.id, subject.chapters)
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-md font-semibold text-gray-800">
                        Select All
                      </label>
                    </div>

                    <div className="custom-chap">
                      {subject.chapters.map((chapter) => (
                        <label
                          key={chapter.id}
                          className="flex items-center cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={
                              !!selectedChapters[subject.id]?.[chapter.id]
                            }
                            onChange={() =>
                              handleChapterSelect(
                                subject.id,
                                chapter.id,
                                chapter.name
                              )
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-base text-gray-700">
                            {chapter.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Start Test Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleStartClick}
          className="test_btn px-6 py-3 text-white transition-colors"
        >
          Take Your Test
        </button>
      </div>

      {/* Question Limit Popup */}
      {showLimitPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-lg overflow-hidden relative">
            {/* Header */}
            <div className="bg-[#007ACC] text-white text-center text-md md:text-2xl font-semibold py-4">
              Select Number Of Questions
            </div>

            {/* Question Options */}
            <div className="px-6 py-4 space-y-4">
              {[50, 100, "Full Test"].map((option) => {
                const isSelected =
                  (typeof option === "number" && questionLimit === option) ||
                  (option === "Full Test" && questionLimit === "Full");

                return (
                  <div
                    key={option}
                    onClick={() =>
                      setQuestionLimit(option === "Full Test" ? "Full" : option)
                    }
                    className={`flex bg-[#F0F8FF] items-center px-6 py-6 rounded-lg cursor-pointer border transition-all ${
                      isSelected
                        ? "border-[#007ACC] text-[#000] bg-blue-50 shadow-sm"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 flex items-center justify-center rounded border ${
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-base font-medium">
                        {typeof option === "number"
                          ? `${option} Questions`
                          : option}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 flex justify-between">
              <button
                onClick={() => setShowLimitPopup(false)}
                className="px-12 py-2 bg-[#CDEFE3] text-[#068457] rounded-full font-medium"
              >
                Back
              </button>
              <button
                style={{
                  boxShadow: `
      0px 4px 8px 0px #00000040,
      -1px 15px 15px 0px #00000036,
      -3px 34px 20px 0px #00000021,
      -5px 60px 24px 0px #0000000A,
      -7px 94px 26px 0px #00000000
    `,
                }}
                onClick={confirmStartTest}
                className="px-4 py-2 bg-[#31CA31] text-white rounded-full font-medium shadow hover:bg-green-600"
              >
                Take your Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
