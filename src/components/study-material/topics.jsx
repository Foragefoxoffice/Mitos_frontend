"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchTopics, fetchQuestionByTopic } from "@/utils/api";
import axios from "axios";
import PremiumPopup from "../PremiumPopup"; // ✅ Imported popup
import CommonLoader from "@/commonLoader";

export default function MeterialsTopicsPage({
  selectedChapter,
  onTopicSelect,
}) {
  const searchParams = useSearchParams();
  const chapterId = selectedChapter?.id || searchParams.get("chapterId");

  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [chapterName, setChapterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false); // ✅ State for popup

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
              // Still return the topic with 0 question count to prevent skipping
              return { ...topic, questionCount: 0 };
            }
          })
        );

        setTopics(topicsWithQuestions);
        setFilteredTopics(topicsWithQuestions); // Show all topics

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

    if (chapterId) {
      loadTopics();
    }
  }, [chapterId]);

  const startTopicTest = (topicId) => {
    router.push(`/user/study-materials?topicId=${topicId}`);
  };

  return (
    <div className="p-4">
      {chapterName && <h2 className="text-lg mb-4">{chapterName}</h2>}

      {loading && <CommonLoader />}
      {error && <p className="text-center pt-10 text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="topic_cards">
          {[...filteredTopics]
            .sort((a, b) => {
              const isAGuestLocked = isGuestUser() && a.isPremium;
              const isBGuestLocked = isGuestUser() && b.isPremium;
              return isAGuestLocked - isBGuestLocked;
            })
            .map((topic) => {
              const locked = isGuestUser() && topic.isPremium;
              const randomBg = `hsl(${Math.floor(
                Math.random() * 360
              )}, 70%, 30%)`;

              return (
                <div
                  key={topic.id}
                  style={{ backgroundColor: randomBg }}
                  className="topic_card topicc_card p-4 rounded-2xl shadow-md text-white"
                >
                  <h2 className="text-lg font-semibold">
                    {topic.name}
                    {locked && (
                      <span className="ml-2 text-red-300 text-sm">
                        🔒 Locked
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={() => {
                      if (locked) {
                        setShowPopup(true);
                      } else {
                        startTopicTest(topic.id);
                      }
                    }}
                    style={{
                      backgroundColor: "#ffffff", // white button
                      color: locked ? "#4b5563" : randomBg, // button text color
                      border: `2px solid ${locked ? "#d1d5db" : randomBg}`, // optional border
                    }}
                    className={`px-4 py-3 mt-3 rounded-full font-semibold transition-transform duration-100 ease-in-out ${
                      locked ? "cursor-not-allowed" : "hover:-translate-y-[1px]"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <span
                        style={{
                          color: locked ? "#4b5563" : randomBg, // button text color
                        }}
                        className="font-bold"
                      >
                        {locked ? "Premium Only" : "Start Studying"}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
        </div>
      )}

      {/* ✅ Premium Popup for locked content */}
      {showPopup && <PremiumPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
}
