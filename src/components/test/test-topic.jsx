"use client";
import React, { useState, useEffect, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchTopics } from "@/utils/api";
import { TestContext } from "@/contexts/TestContext";
import CommonLoader from "@/commonLoader";

export default function TestTopics({ selectedChapter, selectedSubject, selectedPortion }) {
  const searchParams = useSearchParams();
  const chapterId = selectedChapter?.id || searchParams.get("chapterId");
  const [topics, setTopics] = useState([]);
  const [chapterName, setChapterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuantityPopup, setShowQuantityPopup] = useState(false);
  const router = useRouter();

  const { setTestData, selectedTopics = [], setSelectedTopics } = useContext(TestContext);

  const questionLimits = [40, 80, 120, 180];

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

  const handleCheckboxChange = (topicId) => {
    setSelectedTopics((prevSelected = []) => {
      return prevSelected.includes(topicId)
        ? prevSelected.filter((id) => id !== topicId)
        : [...prevSelected, topicId];
    });
  };

  useEffect(() => {
    setSelectedTopics([]); // Reset when chapter changes
  }, [chapterId]);

  const startTest = () => {
    if (selectedTopics.length > 0) {
      setShowQuantityPopup(true);
    } else {
      alert("Please select at least one topic.");
    }
  };

  const handleLimitSelection = (limit) => {

    const fullTestData = {
      testname: "topics-custom-test",
      portionId: selectedPortion?.id,
      subjectId: selectedSubject?.id,
      chapterId: selectedChapter?.id,
      topics: [...selectedTopics],
      questionCount,
    };

    setTestData(fullTestData);
    setShowQuantityPopup(false);
    router.push("/user/test"); // Auto-redirect on selection
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Attempt by Topic</h1>

      {loading &&  <CommonLoader />}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="topic_cards">
            {topics.map((topic) => (
              <div key={topic.id} className="topic_card">
                <input
                  type="checkbox"
                  id={`topic-${topic.id}`}
                  className="cursor-pointer"
                  checked={(selectedTopics || []).includes(topic.id)}
                  onChange={() => handleCheckboxChange(topic.id)}
                />
                <label htmlFor={`topic-${topic.id}`} className="cursor-pointer">
                  {topic.name}
                </label>
              </div>
            ))}
          </div>

          <button className="mx-auto mt-6 btn" onClick={startTest}>
            Start Test
          </button>
        </>
      )}

      {showQuantityPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="question_popup">
            <h2 className="">Select Number Of Questions</h2>
            {questionLimits.map((limit, index) => (
              <label key={index}>
                <input
                  type="radio"
                  name="questionLimit"
                  value={limit}
                  onChange={() => handleLimitSelection(limit)}
                  className="form-radio"
                />
                <span className="text-gray-800">
                  {limit === "full"
                    ? `Full Test (${topics.length * 10} Questions)`
                    : `${limit} Questions`}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
