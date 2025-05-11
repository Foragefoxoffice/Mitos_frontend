"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchQuestionType, fetchQuestionBychapter } from "@/utils/api";
import { useSelectedQuestionTypes } from "@/contexts/SelectedQuestionTypesContext";

export default function QuestiontypePage({ selectedChapter }) {
  const {
    selectedQuestionTypes,
    setSelectedQuestionTypes,
    chapterId,
    setChapterId,
  } = useSelectedQuestionTypes();
  const [availableQuestionTypes, setAvailableQuestionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const router = useRouter();

  // Reset selectedQuestionTypes when chapterId changes or component unmounts
  useEffect(() => {
    return () => {
      setSelectedQuestionTypes([]);
    };
  }, [setSelectedQuestionTypes]);

  // Set the chapterId in the context when the chapter changes
  useEffect(() => {
    if (selectedChapter) {
      setChapterId(selectedChapter.id);
    }
  }, [selectedChapter, setChapterId]);

  // Fetch questions and determine available question types when chapterId changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First fetch all questions for this chapter
        const questionsResponse = await fetchQuestionBychapter(chapterId);
        const questionsData = questionsResponse.data;

        if (!Array.isArray(questionsData)) {
          throw new Error("Invalid questions data format");
        }

        // Get unique questionTypeIds from questions in this chapter
        const questionTypeIdsInChapter = [...new Set(
          questionsData.map(q => q.questionTypeId)
        )];

        // Now fetch all question types and filter by those present in this chapter
        const typesResponse = await fetchQuestionType();
        const allQuestionTypes = typesResponse.data;

        if (!Array.isArray(allQuestionTypes)) {
          throw new Error("Invalid question types data format");
        }

        // Filter to only question types that exist in this chapter's questions
        const chapterQuestionTypes = allQuestionTypes.filter(type => 
          questionTypeIdsInChapter.includes(type.id)
        );

        setAvailableQuestionTypes(chapterQuestionTypes);
        
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Unable to load question types. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) {
      loadData();
    }
  }, [chapterId]);

  const handleCheckboxChange = (questionTypeId) => {
    if (selectedQuestionTypes.includes(questionTypeId)) {
      setSelectedQuestionTypes(
        selectedQuestionTypes.filter((id) => id !== questionTypeId)
      );
    } else {
      setSelectedQuestionTypes([...selectedQuestionTypes, questionTypeId]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestionTypes([]);
    } else {
      setSelectedQuestionTypes(
        availableQuestionTypes.map((questionType) => questionType.id)
      );
    }
    setSelectAll(!selectAll);
  };

  const startTest = () => {
    if (selectedQuestionTypes.length > 0) {
      router.push("/user/practice");
    } else {
      alert("Please select at least one question type.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Select Question Types</h1>
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-center pt-10">{error}</p>}
      {!loading && !error && (
        <>
          {availableQuestionTypes.length > 0 ? (
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
                    Select All ({availableQuestionTypes.length} Types)
                  </label>
                </div>

                {availableQuestionTypes.map((questionType) => (
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
              <button className="mx-auto mt-6 btn" onClick={startTest}>
                Start Practice
              </button>
            </>
          ) : (
            <p className="text-center pt-10">
              No question types available for this chapter.
            </p>
          )}
        </>
      )}
    </div>
  );
}