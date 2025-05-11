"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchTopics, fetchQuestionByTopic } from "@/utils/api";
import axios from "axios";

export default function MeterialsTopicsPage({ selectedChapter, onTopicSelect }) {
  const searchParams = useSearchParams();
  const chapterId = selectedChapter?.id || searchParams.get("chapterId");
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [chapterName, setChapterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

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

  const startTopicTest = (topicId) => {
    router.push(`/user/study-materials?topicId=${topicId}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Study Material by Topic</h1>
      {chapterName && <h2 className="text-lg mb-4">{chapterName}</h2>}

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-center pt-10">{error}</p>}

      {!loading && !error && (
        <div className="topic_cards ">
          {filteredTopics.map((topic) => (
            <div key={topic.id} className="topic_card topicc_card">
              <h2 className="text-lg text-[#350954] font-semibold">{topic.name}</h2>
              <button
                onClick={() => startTopicTest(topic.id)}
                className="w-full text-left p-4 hover:bg-white hover:text-[#350954] rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold  px-2 py-1 rounded-full"> 
                  View Material</span>
      
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}