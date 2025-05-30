"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchTopics, fetchQuestionByTopic } from "@/utils/api";
import { useSelectedTopics } from "@/contexts/SelectedTopicsContext";
import axios from "axios";

export default function TopicsPage({ selectedChapter, onTopicSelect }) {
  const searchParams = useSearchParams();
  const chapterId = selectedChapter?.id || searchParams.get("chapterId");
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [chapterName, setChapterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const router = useRouter();
  const { selectedTopics, setSelectedTopics } = useSelectedTopics();

  useEffect(() => {
    const loadTopics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch topics first
        const response = await fetchTopics(chapterId);
        const { data, chapterName } = response;

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received");
        }

        setChapterName(chapterName);

        // Check questions for each topic and filter
        const topicsWithQuestions = await Promise.all(
          data.map(async (topic) => {
            try {
              const questionsResponse = await fetchQuestionByTopic(topic.id);
              let questionCount = 0;
              
              // Handle different response structures
              if (Array.isArray(questionsResponse?.data)) {
                questionCount = questionsResponse.data.length;
              } else if (Array.isArray(questionsResponse)) {
                questionCount = questionsResponse.length;
              }
              
              return { ...topic, questionCount };
            } catch (error) {
              if (axios.isAxiosError(error) && error.response?.status === 404) {
                return { ...topic, questionCount: 0 }; // No questions found
              }
              console.error(`Error fetching questions for topic ${topic.id}:`, error);
              return { ...topic, questionCount: 0 }; // Treat errors as no questions
            }
          })
        );

        // Filter topics with at least one question
        const validTopics = topicsWithQuestions.filter(topic => topic.questionCount > 0);
        
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

  // Reset selectedTopics and selectAll when component mounts or topics change
  useEffect(() => {
    setSelectedTopics([]);
    setSelectAll(false);
  }, [filteredTopics, setSelectedTopics]);

  const handleCheckboxChange = (topicId) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter((id) => id !== topicId));
      setSelectAll(false);
    } else {
      const newSelectedTopics = [...selectedTopics, topicId];
      setSelectedTopics(newSelectedTopics);
      if (newSelectedTopics.length === filteredTopics.length) {
        setSelectAll(true);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(filteredTopics.map((topic) => topic.id));
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
      {error && <p className="text-center pt-10">{error}</p>}

      {!loading && !error && (
        <>
          <div className="topic_cards">
            {filteredTopics.length > 0 && (
              <div className="topic_card">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                <label htmlFor="selectAll" className="cursor-pointer">
                  Full Chapter ({filteredTopics.length} topics)
                </label>
              </div>
            )}

            {filteredTopics.map((topic) => (
              <div key={topic.id} className="topic_card">
                <input
                  type="checkbox"
                  id={`topic-${topic.id}`}
                  className="cursor-pointer"
                  checked={selectedTopics.includes(topic.id)}
                  onChange={() => handleCheckboxChange(topic.id)}
                />
                <label htmlFor={`topic-${topic.id}`} className="cursor-pointer">
                  {topic.name}
                   {/* ({topic.questionCount} questions) */}
                </label>
              </div>
            ))}
          </div>

          {filteredTopics.length > 0 && (
            <button
              className="mx-auto mt-6 btn"
              onClick={startTest}
            >
              Start Practice
            </button>
          )}
        </>
      )}
    </div>
  );
}