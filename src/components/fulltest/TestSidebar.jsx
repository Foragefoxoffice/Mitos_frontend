"use client";
import React, { useEffect } from "react";

export const TestSidebar = ({
  filteredQuestions,
  userAnswers,
  visitedQuestions,
  markedQuestions,
  handleQuestionNavigation,
  questionNavRefs,
  onShowAnswers
}) => {
  // Navigate to first question when show answers mode is activated
  useEffect(() => {
    if (onShowAnswers && filteredQuestions.length > 0) {
      handleQuestionNavigation(0);
    }
  }, [onShowAnswers, filteredQuestions.length, handleQuestionNavigation]);

  return (
    <>
      <ul className="answer_label">
        {onShowAnswers ? (
          <>
            <li className="text-[#4CAF50] after:bg-[#4CAF50]">Correct</li>
            <li className="text-[#F44336] after:bg-[#F44336]">Wrong</li>
            <li className="text-gray-400 after:bg-gray-400">Unanswered</li>
          </>
        ) : (
          <>
            <li className="text-[var(--primery)] after:bg-[var(--primery)]">Answered</li>
            <li className="text-[#e49331] after:bg-[#e49331]">Un-answered</li>
            <li className="text-gray-400 after:bg-gray-400">Not visited</li>
            <li className="text-[#498FE0] after:bg-[#498FE0]">Mark as Review</li>
          </>
        )}
      </ul>
      <div className="rounded_navs">
        {filteredQuestions.map((question, index) => {
          const isAnswered = userAnswers[question.id] !== undefined;
          const isVisited = visitedQuestions[question.id] !== undefined;
          const isMarked = markedQuestions[question.id] !== undefined;
          const isCorrect = userAnswers[question.id] === question.correctOption;

          let buttonColor = "bg-[#B19CBE]"; 
          
          if (onShowAnswers) {
            if (isAnswered) {
              buttonColor = isCorrect ? "bg-[#4CAF50]" : "bg-[#F44336]";
            } else {
              buttonColor = "bg-gray-400 text-black"; 
            }
          } else {
            // Original coloring logic when not showing answers
            if (isAnswered) {
              buttonColor = "bg-[var(--primery)]";
            } else if (isVisited) {
              buttonColor = "bg-[#e49331]";
            }
            if (isMarked) {
              buttonColor = "bg-[#498FE0]";
            }
          }

          return (
            <button
              key={question.id}
              ref={(el) => (questionNavRefs.current[index] = el)}
              onClick={() => handleQuestionNavigation(index)}
              className={`p-2 rounded-lg text-center ${buttonColor} text-white min-w-[40px]`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </>
  );
};