"use client";
import React from "react";

export const TestNavigation = ({
  currentQuestionIndex,
  filteredQuestions,
  handlePrevious,
  handleNext,
  toggleMarkAsReview,
  markedQuestions,
  question,
}) => {
  return (
    <div className="nav_btns">
      <button
        onClick={handlePrevious}
        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        disabled={currentQuestionIndex === 0}
      >
        Previous
      </button>
      <button
        onClick={() => toggleMarkAsReview(question.id)}
        className={`px-4 py-2 ${
          markedQuestions[question.id]
            ? "bg-yellow-500"
            : "bg-gray-300"
        } rounded hover:bg-yellow-600`}
      >
        {markedQuestions[question.id]
          ? "Unmark Review"
          : "Mark as Review"}
      </button>
      <button
        onClick={handleNext}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={currentQuestionIndex === filteredQuestions.length - 1}
      >
        Next
      </button>
    </div>
  );
};