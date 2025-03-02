"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchTopics } from "@/utils/api";
import { useSelectedTopics } from "@/contexts/SelectedTopicsContext";

export default function TopicsPage({ selectedChapter, onTopicSelect }) {
  const searchParams = useSearchParams();
  const chapterId = selectedChapter?.id || searchParams.get("chapterId"); // Fallback if selectedChapter is undefined
  const [topics, setTopics] = useState([]);
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
        const response = await fetchTopics(chapterId);
        const { data, chapterName } = response;

        if (Array.isArray(data)) {
          setTopics(data);
          setChapterName(chapterName);
        } else {
          throw new Error("Invalid data format received");
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

  // Handle individual topic selection
  const handleCheckboxChange = (topicId) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter((id) => id !== topicId));
      setSelectAll(false); // Deselect "Select All" if any topic is unchecked
    } else {
      const newSelectedTopics = [...selectedTopics, topicId];
      setSelectedTopics(newSelectedTopics);
      if (newSelectedTopics.length === topics.length) {
        setSelectAll(true); // Automatically select "Select All" if all topics are selected
      }
    }
  };

  // Handle "Select All" checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(topics.map((topic) => topic.id));
    }
    setSelectAll(!selectAll);
  };

  // Start test for selected topics
  const startTest = () => {
    if (selectedTopics.length > 0) {
      router.push("/user/test");
    } else {
      alert("Please select at least one topic.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Attempt by Topic</h1>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="topic_cards">
            <div className="topic_card">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <label htmlFor="selectAll" className="cursor-pointer">
                Full Chapter
              </label>
            </div>

            {topics.map((topic) => (
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
                </label>
              </div>
            ))}
          </div>

          <button
            className="mx-auto mt-6 btn "
            onClick={startTest}
          >
            Start Test
          </button>
        </>
      )}
    </div>
  );
}
