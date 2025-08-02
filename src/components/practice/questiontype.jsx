"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchQuestionType, fetchQuestionBychapter } from "@/utils/api";
import { useSelectedQuestionTypes } from "@/contexts/SelectedQuestionTypesContext";
import PremiumPopup from "../PremiumPopup"; // Make sure this exists
import { m } from "framer-motion";
import CommonLoader from "@/commonLoader";
import { HiOutlineSearch } from "react-icons/hi";

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
  const [isGuest, setIsGuest] = useState(false);

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
    setIsGuest(isGuestUser());
  }, []);

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

        const questionTypeIdsInChapter = [
          ...new Set(questionsData.map((q) => q.questionTypeId)),
        ];

        const typesResponse = await fetchQuestionType();
        const allQuestionTypes = typesResponse.data;

        if (!Array.isArray(allQuestionTypes)) {
          throw new Error("Invalid question types data format");
        }

        const chapterQuestionTypes = allQuestionTypes.filter((type) =>
          questionTypeIdsInChapter.includes(type.id)
        );

        // Sort question types - unlocked first for guest users
        const sortedQuestionTypes = isGuest
          ? [...chapterQuestionTypes].sort((a, b) => {
              if (a.isPremium === b.isPremium) return 0;
              return a.isPremium ? 1 : -1;
            })
          : chapterQuestionTypes;

        setAvailableQuestionTypes(sortedQuestionTypes);
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
  }, [chapterId, isGuest]);

  const handleCheckboxChange = (questionType) => {
    const isLocked = isGuest && questionType.isPremium;
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
        (t) => !isGuest || !t.isPremium
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
        (type) => !isGuest || !type.isPremium
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-[#017bcd] mb-4">
          Attempt by Question Type
        </h1>
        <div className="relative w-[20%]">
          <span className="absolute inset-y-0 left-3 flex items-center text-[#00497A]">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </span>
          <input
            className="w-full pl-10 placeholder:text-[#00497A] h-[10%] p-3 bg-[#DFF4FF] rounded-lg border border-[#007acc80] text-[#007acc] focus:outline-none focus:ring-2 focus:ring-[#007acc80] transition duration-200"
            placeholder="Search"
            type="search"
          />
        </div>
      </div>

      {loading && <CommonLoader />}
      {error && <p className="text-center pt-10 text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {availableQuestionTypes.length > 0 ? (
            <>
              <div className="topic_cards space-y-3">
                {!isGuest && (
                  <div className="topic_card attemtpt-checkbox">
                    <input
                      className={`
    appearance-none 
    rounded-full 
    border border-blue-600 
    checked:bg-blue-600 
    checked:border-blue-600 
    flex items-center justify-center 
    relative 
    cursor-pointer 
    disabled:opacity-50
    after:content-['✓'] 
    after:text-white 
    after:text-xl
    after:font-bold 
    after:absolute 
    after:top-1/2 
    after:left-1/2 
    after:-translate-x-1/2 
    after:-translate-y-[57%]
    after:hidden 
    checked:after:block
  `}
                      type="checkbox"
                      id="selectAll"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                    <label
                      htmlFor="selectAll"
                      className="cursor-pointer text-lg ml-2"
                    >
                      Select All ({availableQuestionTypes.length} Types)
                    </label>
                  </div>
                )}

                {availableQuestionTypes.map((type) => {
                  const isLocked = isGuest && type.isPremium;
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
                      <label
                        style={{ width: 30 }}
                        className="inline-flex items-center cursor-pointer attemtpt-checkbox"
                      >
                        <input
                          type="checkbox"
                          id={`questionType-${type.id}`}
                          checked={selectedQuestionTypes.includes(type.id)}
                          disabled={isLocked}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleCheckboxChange(type);
                          }}
                          className={`
    appearance-none 
    rounded-full 
    border border-blue-600 
    checked:bg-blue-600 
    checked:border-blue-600 
    flex items-center justify-center 
    relative 
    cursor-pointer 
    disabled:opacity-50
    after:content-['✓'] 
    after:text-white 
    after:text-xl
    after:font-bold 
    after:absolute 
    after:top-1/2 
    after:left-1/2 
    after:-translate-x-1/2 
    after:-translate-y-[57%]
    after:hidden 
    checked:after:block
  `}
                        />
                      </label>

                      <label
                        htmlFor={`questionType-${type.id}`}
                        className="cursor-pointer text-lg"
                      >
                        {type.name}
                        {type.isPremium && isGuest && (
                          <span className="text-red-500 ml-2">🔒 Locked</span>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
              <button
                className="mx-auto mt-14 btn bg-blue-600 text-white px-4 py-2 rounded"
                onClick={startTest}
              >
                Lets Practice
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
