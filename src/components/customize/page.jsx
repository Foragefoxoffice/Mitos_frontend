"use client";

import React, { useState, useEffect, useContext } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchSubjectsByPortions,
  fetchChaptersBySubject,
  fetchChapterTopics,
  fetchQuestionBychapter,
} from "@/utils/api";
import CommonLoader from "@/commonLoader";
import { TestContext } from "@/contexts/TestContext";
import TopicsPage from "@/components/TopicsPage";
import TestSubject from "@/components/TestSubject"; // 👈 Import here

export default function CustomizePage() {
  const searchParams = useSearchParams();
  const chapterId = searchParams.get("chapterId");
  const { selectedPortion } = useContext(TestContext);

  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chapterId || !selectedPortion?.id) {
      setError("Chapter ID or portion not available.");
      setLoading(false);
      return;
    }

    const loadChapterData = async () => {
      try {
        const subjects = await fetchSubjectsByPortions(selectedPortion.id);

        let foundChapter = null;
        let chapterTopicCount = 0;
        let chapterQuestionCount = 0;

        for (const subject of subjects) {
          const chapters = await fetchChaptersBySubject(subject.id);
          const match = chapters.find((ch) => String(ch.id) === chapterId);

          if (match) {
            try {
              const topics = await fetchChapterTopics(match.id);
              chapterTopicCount = Array.isArray(topics) ? topics.length : 0;
            } catch {
              chapterTopicCount = 0;
            }

            try {
              const questions = await fetchQuestionBychapter(match.id);
              chapterQuestionCount = Array.isArray(questions?.data)
                ? questions.data.length
                : Array.isArray(questions)
                ? questions.length
                : 0;
            } catch {
              chapterQuestionCount = 0;
            }

            foundChapter = {
              id: match.id,
              name: match.name,
              subjectName: subject.name,
              topicCount: chapterTopicCount,
              questionCount: chapterQuestionCount,
            };

            break;
          }
        }

        if (foundChapter) {
          setChapter(foundChapter);
        } else {
          throw new Error("Chapter not found in current portion.");
        }
      } catch (err) {
        console.error("Failed to load chapter data", err);
        setError("Failed to load chapter data.");
      } finally {
        setLoading(false);
      }
    };

    loadChapterData();
  }, [chapterId, selectedPortion]);

  return (
    <div className="p-4 inside_practice">
      {loading && <CommonLoader />}
      {error && <p className="text-center pt-10 text-red-600">{error}</p>}
      {!loading && !error && chapter && (
        <TopicsPage selectedChapter={chapter} />
      )}

      {/* 🧩 Show TestSubject data */}
      {!loading && !error && selectedPortion && (
        <div className="mt-10">
          <TestSubject selectedPortion={selectedPortion} />
        </div>
      )}
    </div>
  );
}
