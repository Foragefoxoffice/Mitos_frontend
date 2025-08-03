"use client";

import React, { useState, useEffect, useContext } from "react";
import { fetchSubjectsByPortions, fetchChaptersBySubject } from "@/utils/api";
import { TestContext } from "@/contexts/TestContext";
import { useRouter } from "next/navigation";
import { FaAngleDown, FaMinus, FaXmark } from "react-icons/fa6";
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
        const subjectsWithDetails = await Promise.all(
          subjectsData.map(async (subject) => {
            const details = await fetchChaptersBySubject(subject.id);
            return {
              ...subject,
              chapters: Array.isArray(details) ? details : [],
            };
          })
        );
        const sorted = subjectsWithDetails.sort(
          (a, b) => b.chapters.length - a.chapters.length
        );
        setSubjects(sorted);
        const defaultExpanded = sorted.find((s) => s.chapters.length > 0);
        if (defaultExpanded) setExpandedSubjectId(defaultExpanded.id);
      } catch (err) {
        setError("Unable to load subjects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadSubjects();
  }, [selectedPortion]);

  const toggleSubject = (id) => {
    setExpandedSubjectId((prev) => (prev === id ? null : id));
  };

  const toggleChapter = (subjectId, chapterId, chapterName) => {
    setSelectedChapters((prev) => {
      const subjectChapters = prev[subjectId] || {};
      const updated = subjectChapters[chapterId]
        ? { ...subjectChapters, [chapterId]: undefined }
        : { ...subjectChapters, [chapterId]: chapterName };
      return { ...prev, [subjectId]: updated };
    });
  };

  const toggleSelectAll = (subjectId, chapters) => {
    setSelectedChapters((prev) => {
      const allSelected = chapters.every((c) => prev[subjectId]?.[c.id]);
      const updated = allSelected
        ? {}
        : Object.fromEntries(chapters.map((c) => [c.id, c.name]));
      return { ...prev, [subjectId]: updated };
    });
  };

  const handleStart = () => {
    const selectedIds = Object.values(selectedChapters).flatMap((chapters) =>
      Object.keys(chapters).filter((id) => chapters[id])
    );
    if (!selectedIds.length) return alert("Select at least one chapter");
    setShowLimitPopup(true);
  };

  const confirmStartTest = () => {
    const selectedIds = Object.values(selectedChapters).flatMap((chapters) =>
      Object.keys(chapters).filter((id) => chapters[id])
    );
    setTestData({
      testname: "custom-test",
      portionId: selectedPortion.id,
      chapterIds: selectedIds,
      questionLimit,
    });
    router.push("/user/test");
  };

  return (
    <div className="py-6 relative">
      {loading && <CommonLoader />}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="space-y-3">
        {subjects.map((subject) => {
          const allSelected = subject.chapters.every(
            (ch) => selectedChapters[subject.id]?.[ch.id]
          );
          const isExpanded = expandedSubjectId === subject.id;
          const bgColors = {
            Biology: "bg-[#32CD32]",
            Physics: "bg-[#B57170]",
            Chemistry: "bg-[#E1AD01]",
          };

          return (
            <div key={subject.id} className="rounded-lg overflow-hidden">
              <div
                className={`flex justify-between items-center px-4 py-6 text-white cursor-pointer ${
                  bgColors[subject.name.split(" ")[1]] || "bg-gray-400"
                }`}
                onClick={() => toggleSubject(subject.id)}
              >
                <h3 className="font-bold text-lg">
                  {subject.name} | {subject.chapters.length} Chapters
                </h3>
                <div
                  className={`transition-transform duration-300 w-7 h-7 rounded-full flex items-center justify-center ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  style={{
                    backgroundColor:
                      bgColors[subject.name.split(" ")[1]]?.replace(
                        "bg-",
                        "#"
                      ) || "#888",
                  }}
                >
                  <FaAngleDown className="text-white text-sm" />
                </div>
              </div>

              {isExpanded && (
                <div className="bg-white p-6">
                  {/* Selected Tags */}
                  {Object.entries(selectedChapters).some(
                    ([, chaps]) => Object.keys(chaps).length > 0
                  ) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Object.entries(selectedChapters).flatMap(
                        ([subjectId, chaps]) =>
                          Object.entries(chaps).map(
                            ([chapterId, chapterName]) =>
                              chapterName && (
                                <div
                                  key={chapterId}
                                  className="flex items-center bg-[#DFF4FF] text-[#007ACC] px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                                >
                                  {chapterName}
                                  <button
                                    onClick={() =>
                                      toggleChapter(
                                        subjectId,
                                        chapterId,
                                        chapterName
                                      )
                                    }
                                    className="ml-2 h-5 w-5 bg-[#007ACC] rounded-full text-[#fff]"
                                  >
                                    &times;
                                  </button>
                                </div>
                              )
                          )
                      )}
                    </div>
                  )}
                  <div className="flex w-40 items-center mb-4 bg-[#DFF4FF] rounded-full px-4 py-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() =>
                        toggleSelectAll(subject.id, subject.chapters)
                      }
                      className="w-4 h-4 border-2 border-blue-500"
                    />

                    <label className="ml-2 font-medium text-[#004C7F]">
                      Select All
                    </label>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 mt-6">
                    {subject.chapters.map((chapter) => (
                      <label
                        key={chapter.id}
                        className="flex items-center text-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={!!selectedChapters[subject.id]?.[chapter.id]}
                          onChange={() =>
                            toggleChapter(subject.id, chapter.id, chapter.name)
                          }
                          className="w-4 h-4"
                        />
                        <span className="ml-2 text-md text-black">
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

      <div className="mt-10 text-center">
        <button
          onClick={handleStart}
          className="px-8 py-3 bg-[#31CA31] text-white rounded-full font-medium shadow hover:bg-green-600"
        >
          Take Your Test
        </button>
      </div>

      {showLimitPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-lg overflow-hidden relative">
            {/* Header */}
            <div className="bg-[#007ACC] text-white text-center text-md md:text-3xl font-semibold py-6">
              Select Number Of Questions
            </div>

            {/* Question Options */}
            <div className="px-6 py-4 space-y-4">
              {[50, 100, 180, "Full Test"].map((option) => {
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
