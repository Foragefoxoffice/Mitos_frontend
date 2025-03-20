"use client";
import React, { useState, useEffect } from "react";
import { fetchChapter, fetchChapterTopics, fetchChapterTtype } from "@/utils/api";
import axios from "axios"; 

export default function Chapter({ selectedSubject, onChapterSelect, onScreenSelection }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedSubject?.id) return;

    const loadChapters = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchChapter(selectedSubject.id);
        if (!Array.isArray(data)) throw new Error("Invalid data format received");

        // Fetch topic counts for each chapter
        const chaptersWithTopics = await Promise.all(
          data.map(async (chapter) => {
            try {
              const topics = await fetchChapterTopics(chapter.id);
              return { ...chapter, topicCount: Array.isArray(topics) ? topics.length : 0 };
            } catch (error) {
              if (axios.isAxiosError(error) && error.response?.status === 404) {
                // No topics found (404), set topicCount to 0
                return { ...chapter, topicCount: 0 };
              }
              console.error(`Error fetching topics for chapter ${chapter.id}:`, error);
              return { ...chapter, topicCount: "N/A" }; // For other errors
            }
          })
        );

        setChapters(chaptersWithTopics);
      } catch (err) {
        console.error("Failed to fetch chapters:", err);
        setError("There no chapters added in this subject yet. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadChapters();
  }, [selectedSubject]);

  const handleTopicClick = (chapter) => {
    onChapterSelect(chapter);
    onScreenSelection("topic");
  };

  const handleQuestionTypeClick = (chapter) => {
    onChapterSelect(chapter);
    onScreenSelection("questiontype");
  };

  return (
    <div className="p-4">
      {loading && <p>Loading...</p>}
      {error && <p className="text-center pt-10">{error}</p>}
      {!loading && !error && (
        <div className="chapter_cards">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="subject_card">
              <h2>{chapter.name}</h2>
              <p className="text-sm text-gray-700">{chapter.topicCount} Topics</p>
              <div className="btns_group">
                <button onClick={() => handleTopicClick(chapter)}>
                  Attempt by Topic
                </button>
                <button onClick={() => handleQuestionTypeClick(chapter)}>
                  Attempt by Question Type
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
