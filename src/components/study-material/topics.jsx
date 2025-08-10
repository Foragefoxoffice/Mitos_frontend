"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchTopics, fetchQuestionByTopic } from "@/utils/api";
import axios from "axios";
import PremiumPopup from "../PremiumPopup";
import CommonLoader from "@/commonLoader";

export default function MeterialsTopicsPage({
  selectedChapter,
  onTopicSelect,
  searchTerm = "", // ⬅️ from nav.js
}) {
  const searchParams = useSearchParams();
  const chapterId = selectedChapter?.id || searchParams.get("chapterId");

  const [topics, setTopics] = useState([]);
  const [chapterName, setChapterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  const router = useRouter();

  const isGuestUser = () => {
    if (typeof window !== "undefined") {
      const roleFromLocal = localStorage.getItem("role");
      const roleFromCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("role="))
        ?.split("=")[1];
      return (roleFromLocal || roleFromCookie) === "guest";
    }
    return false;
  };

  useEffect(() => {
    const loadTopics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchTopics(chapterId);
        const { data, chapterName } = response;

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received");
        }

        setChapterName(chapterName);

        const topicsWithQuestions = await Promise.all(
          data.map(async (topic) => {
            try {
              const questionsResponse = await fetchQuestionByTopic(topic.id);
              let questionCount = 0;

              if (Array.isArray(questionsResponse?.data)) {
                questionCount = questionsResponse.data.length;
              } else if (Array.isArray(questionsResponse)) {
                questionCount = questionsResponse.length;
              }

              return { ...topic, questionCount };
            } catch (error) {
              console.error(
                `❌ Error fetching questions for topic ID ${topic.id}:`,
                error
              );
              return { ...topic, questionCount: 0 };
            }
          })
        );

        setTopics(topicsWithQuestions);

        if (topicsWithQuestions.length === 0) {
          setError("No topics found in this chapter.");
        }
      } catch (err) {
        console.error("Failed to fetch topics:", err);
        setError("Unable to load topics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) loadTopics();
  }, [chapterId]);

  // 🔎 Filter by searchTerm (name only, case-insensitive)
  const filteredTopics = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return topics;
    return topics.filter((t) =>
      String(t.name || "")
        .toLowerCase()
        .includes(term)
    );
  }, [topics, searchTerm]);

  // reset selected topic if it’s not visible anymore
  useEffect(() => {
    if (
      selectedTopicId &&
      !filteredTopics.some((t) => t.id === selectedTopicId)
    ) {
      setSelectedTopicId(null);
    }
  }, [filteredTopics, selectedTopicId]);

  const toggleTopic = (topic) => {
    const locked = isGuestUser() && topic.isPremium;
    if (locked) {
      setShowPopup(true);
      return;
    }
    setSelectedTopicId((prev) => (prev === topic.id ? null : topic.id));
  };

  const startSelectedTopic = () => {
    if (!selectedTopicId) return;
    router.push(`/user/study-materials?topicId=${selectedTopicId}`);
  };

  const noMatches =
    !loading &&
    !error &&
    filteredTopics.length === 0 &&
    searchTerm.trim().length > 0;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Attempt by Topic</h1>
      {chapterName && <h2 className="text-lg mb-4">{chapterName}</h2>}

      {loading && <CommonLoader />}
      {error && <p className="text-center pt-10 text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {noMatches ? (
            <p className="text-center pt-10">No topics match your search.</p>
          ) : (
            <>
              <div className="topic_cards space-y-3 pb-24">
                {[...filteredTopics]
                  .sort((a, b) => {
                    const aLocked = isGuestUser() && a.isPremium;
                    const bLocked = isGuestUser() && b.isPremium;
                    return aLocked - bLocked;
                  })
                  .map((topic) => {
                    const locked = isGuestUser() && topic.isPremium;
                    const checked = selectedTopicId === topic.id;

                    return (
                      <div
                        key={topic.id}
                        className={`topic_card flex items-center space-x-2 p-3 border rounded-lg ${
                          locked
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        onClick={() => toggleTopic(topic)}
                      >
                        <input
                          type="checkbox"
                          readOnly
                          checked={checked}
                          className="cursor-pointer"
                        />
                        <span className="text-lg font-normal flex-1">
                          {topic.name}
                          {locked && (
                            <span className="text-red-500 ml-2">🔒 Locked</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {selectedTopicId && (
                <div className="flex justify-center mt-0">
                  <button
                    className="btn bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={startSelectedTopic}
                  >
                    Start Studying
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {showPopup && <PremiumPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
}
