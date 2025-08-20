"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  fetchChapter,
  fetchChapterTopics,
  fetchQuestionBychapter,
} from "@/utils/api";
import axios from "axios";
import CommonLoader from "@/commonLoader";
import { FiInfo } from "react-icons/fi";

export default function Chapter({
  selectedSubject,
  onChapterSelect,
  onScreenSelection,
  searchTerm = "",
}) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // keep chapter colors stable across filters
  const colorCacheRef = useRef({}); // { [chapterId]: {rgb, r,g,b, buttonTextColor} }

  useEffect(() => {
    if (!selectedSubject?.id) return;

    const loadChapters = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchChapter(selectedSubject.id);
        if (!Array.isArray(data))
          throw new Error("Invalid data format received");

        const allChapters = await Promise.all(
          data.map(async (chapter) => {
            let topicCount = 0;
            let questionCount = 0;

            try {
              const topics = await fetchChapterTopics(chapter.id);
              topicCount = Array.isArray(topics) ? topics.length : 0;
            } catch (topicError) {
              if (
                axios.isAxiosError(topicError) &&
                topicError.response?.status === 404
              ) {
                topicCount = 0;
              } else {
                console.error(
                  `Error fetching topics for chapter ${chapter.id}:`,
                  topicError
                );
                topicCount = "N/A";
              }
            }

            try {
              const questionsResponse = await fetchQuestionBychapter(
                chapter.id
              );
              if (Array.isArray(questionsResponse?.data)) {
                questionCount = questionsResponse.data.length;
              } else if (Array.isArray(questionsResponse)) {
                questionCount = questionsResponse.length;
              } else {
                questionCount = 0;
              }
            } catch (questionError) {
              if (
                axios.isAxiosError(questionError) &&
                questionError.response?.status === 404
              ) {
                questionCount = 0;
              } else {
                console.error(
                  `Error fetching questions for chapter ${chapter.id}:`,
                  questionError
                );
                questionCount = "N/A";
              }
            }

            // stable color per chapter
            if (!colorCacheRef.current[chapter.id]) {
              const darkColor = getRandomDarkColor();
              const contrastColor = getContrastColor(
                darkColor.r,
                darkColor.g,
                darkColor.b
              );
              colorCacheRef.current[chapter.id] = {
                randomBgColor: darkColor.rgb,
                buttonTextColor: contrastColor,
              };
            }

            return {
              ...chapter,
              topicCount,
              questionCount,
              ...colorCacheRef.current[chapter.id],
            };
          })
        );

        const chaptersWithQuestions = allChapters.filter(
          (c) => c.questionCount > 0 && c.questionCount !== "N/A"
        );

        setChapters(chaptersWithQuestions);

        if (chaptersWithQuestions.length === 0) {
          setError("No chapters with questions found in this subject.");
        }
      } catch (err) {
        console.error("Failed to fetch chapters:", err);
        setError(
          "There are no chapters added in this subject yet. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    loadChapters();
  }, [selectedSubject]);

  // filter by searchTerm (name only, case-insensitive)
  const filteredChapters = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return chapters;
    return chapters.filter((c) =>
      String(c.name || "")
        .toLowerCase()
        .includes(term)
    );
  }, [chapters, searchTerm]);

  const handleTopicClick = (chapter) => {
    onChapterSelect(chapter);
    onScreenSelection("topic");
  };

  const handleQuestionTypeClick = (chapter) => {
    onChapterSelect(chapter);
    onScreenSelection("questiontype");
  };

  const getRandomDarkColor = () => {
    const r = Math.floor(Math.random() * 90 + 30);
    const g = Math.floor(Math.random() * 90 + 30);
    const b = Math.floor(Math.random() * 90 + 30);
    return { r, g, b, rgb: `rgb(${r}, ${g}, ${b})` };
  };

  const getContrastColor = (r, g, b) => {
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 128 ? "#000000" : "#FFFFFF";
  };

  return (
    <div className="p-4 inside_practice">
      {loading && <CommonLoader />}
      {error && <p className="text-center pt-10">{error}</p>}

      <div className="mb-4">
        <div className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 p-3 md:p-4">
          {/* Icon */}
          <div className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-purple-600">
            <FiInfo className="h-5 w-5 text-white" />
          </div>

          {/* Text */}
          <p className="text-sm md:text-base text-purple-900">
            <span className="font-semibold">Key Info:</span> Each information in
            NCERT is framed in{" "}
            <span className="font-semibold">10+ different question types</span>.
          </p>
        </div>
      </div>

      {!loading && !error && (
        <>
          {/* When search is active but nothing matches */}
          {filteredChapters.length === 0 ? (
            <p className="text-center pt-10">No chapters match your search.</p>
          ) : (
            <div className="chapter_cards">
              {filteredChapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="subject_card"
                  style={{ backgroundColor: chapter.randomBgColor }}
                >
                  <h2>{chapter.name}</h2>
                  <div className="text-sm flex gap-2 text-white">
                    <span className="text-white">
                      {chapter.topicCount} Topics
                    </span>{" "}
                    &
                    <span className="text-white">
                      {chapter.questionCount} Questions
                    </span>
                  </div>
                  <div className="btns_group">
                    <button
                      onClick={() => handleTopicClick(chapter)}
                      className="mt-4 px-4 py-2 rounded-full font-semibold bg-white transition-transform duration-100 ease-in-out hover:-translate-y-[1px]"
                      style={{ color: chapter.randomBgColor }}
                    >
                      Attempt by Topics
                    </button>
                    <button
                      onClick={() => handleQuestionTypeClick(chapter)}
                      className="px-4 py-2 mt-3 md:mt-1 rounded-full font-semibold bg-white transition-transform duration-100 ease-in-out hover:-translate-y-[1px]"
                      style={{ color: chapter.randomBgColor }}
                    >
                      Attempt by Question Type
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
