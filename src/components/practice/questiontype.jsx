"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchQuestionType, fetchQuestionBychapter } from "@/utils/api";
import { useSelectedQuestionTypes } from "@/contexts/SelectedQuestionTypesContext";
import PremiumPopup from "../PremiumPopup"; // Make sure this exists
import { m } from "framer-motion";

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
  const [showPopup, setShowPopup] = useState(false);

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
    return () => {
      setSelectedQuestionTypes([]);
    };
  }, [setSelectedQuestionTypes]);

  useEffect(() => {
    if (selectedChapter) {
      setChapterId(selectedChapter.id);
    }
  }, [selectedChapter, setChapterId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const questionsResponse = await fetchQuestionBychapter(chapterId);
        const questionsData = questionsResponse.data;

        if (!Array.isArray(questionsData)) {
          throw new Error("Invalid questions data format");
        }

        const questionTypeIdsInChapter = [...new Set(
          questionsData.map(q => q.questionTypeId)
        )];

        const typesResponse = await fetchQuestionType();
        const allQuestionTypes = typesResponse.data;

        if (!Array.isArray(allQuestionTypes)) {
          throw new Error("Invalid question types data format");
        }

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

  const handleCheckboxChange = (questionType) => {
    const isLocked = isGuestUser() && questionType.isPremium;
    if (isLocked) {
      setShowPopup(true);
      return;
    }

    const id = questionType.id;
    if (selectedQuestionTypes.includes(id)) {
      setSelectedQuestionTypes(selectedQuestionTypes.filter((i) => i !== id));
      setSelectAll(false);
    } else {
      const updated = [...selectedQuestionTypes, id];
      setSelectedQuestionTypes(updated);
      const allowedCount = availableQuestionTypes.filter(
        (t) => !isGuestUser() || !t.isPremium
      ).length;
      if (updated.length === allowedCount) {
        setSelectAll(true);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestionTypes([]);
    } else {
      const allowed = availableQuestionTypes.filter(
        (type) => !isGuestUser() || !type.isPremium
      );
      setSelectedQuestionTypes(allowed.map((type) => type.id));
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
      {error && <p className="text-center pt-10 text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {availableQuestionTypes.length > 0 ? (
            <>
              <div className="topic_cards space-y-3">
                <div className="topic_card">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <label htmlFor="selectAll" className="cursor-pointer text-lg ml-2">
                    Select All ({availableQuestionTypes.length} Types)
                  </label>
                </div>

                {availableQuestionTypes.map((type) => {
                  const isLocked = isGuestUser() && type.isPremium;
                  return (
                    <div
                      key={type.id}
                      style={{ margin: 0 }}
                      className={`topic_card flex items-center space-x-2 ${
                        isLocked ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={() => {
                        if (isLocked) setShowPopup(true);
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`questionType-${type.id}`}
                        className="cursor-pointer"
                        checked={selectedQuestionTypes.includes(type.id)}
                        disabled={isLocked}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleCheckboxChange(type);
                        }}
                      />
                      <label
                        htmlFor={`questionType-${type.id}`}
                        className="cursor-pointer text-lg"
                      >
                        {type.name}
                       {type.isPremium && isGuestUser() && (
    <span className="text-red-500 ml-2">🔒 Locked</span>
  )}
                      </label>
                    </div>
                  );
                })}
              </div>
              <button
                className="mx-auto mt-6 btn bg-blue-600 text-white px-4 py-2 rounded"
                onClick={startTest}
              >
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

      {showPopup && <PremiumPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
}
