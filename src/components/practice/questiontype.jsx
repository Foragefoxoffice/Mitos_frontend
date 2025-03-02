"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchQuestionType } from "@/utils/api";
import { useSelectedQuestionTypes } from "@/contexts/SelectedQuestionTypesContext";

export default function QuestiontypePage({ selectedChapter }) {
  const { selectedQuestionTypes, setSelectedQuestionTypes, chapterId, setChapterId } = useSelectedQuestionTypes();
  const [questionTypes, setQuestionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const router = useRouter();
  
 console.log(chapterId)
  // Set the chapterId in the context when the chapter changes
  useEffect(() => {
    if (selectedChapter) {
      setChapterId(selectedChapter.id);  // Store the chapterId in context
    }
  }, [selectedChapter, setChapterId]);

  useEffect(() => {
    const loadQuestionTypes = async () => {
      try {
        const { data } = await fetchQuestionType(chapterId);  // Use chapterId from context
        if (Array.isArray(data)) {
          setQuestionTypes(data);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (err) {
        console.error("Failed to fetch question types:", err);
        setError("Unable to load question types. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) {
      loadQuestionTypes();
    }
  }, [chapterId]);

  const handleCheckboxChange = (questionTypeId) => {
    if (selectedQuestionTypes.includes(questionTypeId)) {
      setSelectedQuestionTypes(selectedQuestionTypes.filter((id) => id !== questionTypeId));
    } else {
      setSelectedQuestionTypes([...selectedQuestionTypes, questionTypeId]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestionTypes([]);
    } else {
      setSelectedQuestionTypes(questionTypes.map((questionType) => questionType.id));
    }
    setSelectAll(!selectAll);
  };

  const startTest = () => {
    if (selectedQuestionTypes.length > 0) {
      router.push("/user/test");
    } else {
      alert("Please select at least one question type.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Select Question Types</h1>
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
              Select All Question Types
            </label>
          </div>
    
            {questionTypes.map((questionType) => (
                  <div key={questionType.id} className="topic_card">
                <input
                  type="checkbox"
                  id={`questionType-${questionType.id}`}
                  className="cursor-pointer"
                  checked={selectedQuestionTypes.includes(questionType.id)}
                  onChange={() => handleCheckboxChange(questionType.id)}
                />
                <label
                  htmlFor={`questionType-${questionType.id}`}
                  className="cursor-pointer hover:text-green-500"
                >
                  {questionType.name}
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
