"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchTopics, fetchQuestionByTopic } from "@/utils/api";
import { useSelectedTopics } from "@/contexts/SelectedTopicsContext";
import axios from "axios";
import PremiumPopup from "../PremiumPopup";

export default function TopicsPage({ selectedChapter, onTopicSelect }) {
  const searchParams = useSearchParams();
  const chapterId = selectedChapter?.id || searchParams.get("chapterId");

  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [chapterName, setChapterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const router = useRouter();
  const { selectedTopics, setSelectedTopics } = useSelectedTopics();

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
              if (axios.isAxiosError(error) && error.response?.status === 404) {
                return { ...topic, questionCount: 0 };
              }
              console.error(`Error fetching questions for topic ${topic.id}:`, error);
              return { ...topic, questionCount: 0 };
            }
          })
        );

        const validTopics = topicsWithQuestions.filter((topic) => topic.questionCount > 0);

        setTopics(topicsWithQuestions);
        setFilteredTopics(validTopics);

        if (validTopics.length === 0) {
          setError("No topics with questions found in this chapter.");
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

  useEffect(() => {
    setSelectedTopics([]);
    setSelectAll(false);
  }, [filteredTopics]);

  const handleCheckboxChange = (topic) => {
    if (isGuestUser() && topic.isPremium) {
      setShowPopup(true);
      return;
    }

    if (selectedTopics.includes(topic.id)) {
      const updated = selectedTopics.filter((id) => id !== topic.id);
      setSelectedTopics(updated);
      setSelectAll(false);
    } else {
      const updated = [...selectedTopics, topic.id];
      setSelectedTopics(updated);
      const allowedCount = filteredTopics.filter(
        (t) => !isGuestUser() || !t.isPremium
      ).length;
      if (updated.length === allowedCount) {
        setSelectAll(true);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTopics([]);
    } else {
      const allowed = filteredTopics.filter(
        (topic) => !isGuestUser() || !topic.isPremium
      );
      setSelectedTopics(allowed.map((topic) => topic.id));
    }
    setSelectAll(!selectAll);
  };

  const startTest = () => {
    if (selectedTopics.length > 0) {
      router.push("/user/practice");
    } else {
      alert("Please select at least one topic.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Attempt by Topic</h1>
      {chapterName && <h2 className="text-lg mb-4">{chapterName}</h2>}

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-center pt-10 text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="topic_cards space-y-3">
            {filteredTopics.length > 0 && (
              <div className="topic_card">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                <label htmlFor="selectAll" className="cursor-pointer ml-2">
                  Full Chapter ({filteredTopics.length} topics)
                </label>
              </div>
            )}

            {filteredTopics.map((topic) => {
              const isLocked = isGuestUser() && topic.isPremium;
              return (
                <div
                  key={topic.id}
                  style={{ margin: 0 }}
                  className={`topic_card flex items-center space-x-2 ${
                    isLocked ? "opacity-50 cursor-not-allowed " : ""
                  }`}
                  onClick={() => {
                    if (isLocked) setShowPopup(true);
                  }}
                >
                  <input
                    type="checkbox"
                    id={`topic-${topic.id}`}
                    className="cursor-pointer"
                    checked={selectedTopics.includes(topic.id)}
                    disabled={isLocked}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCheckboxChange(topic);
                    }}
                  />
                  <label htmlFor={`topic-${topic.id}`} className="cursor-pointer">
                    {topic.name}
                    {topic.isPremium && isGuestUser() && (
                      <span className="text-red-500 ml-2">🔒 Premium</span>
                    )}
                  </label>
                </div>
              );
            })}
          </div>

          {filteredTopics.length > 0 && (
            <button className="mx-auto mt-6 btn bg-blue-600 text-white px-4 py-2 rounded" onClick={startTest}>
              Start Practice
            </button>
          )}
        </>
      )}

      {showPopup && <PremiumPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
}
