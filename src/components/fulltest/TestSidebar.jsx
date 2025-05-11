"use client";
import React from "react";

export const TestSidebar = ({
  filteredQuestions,
  userAnswers,
  visitedQuestions,
  markedQuestions,
  handleQuestionNavigation,
  questionNavRefs,
}) => {
  return (
    <>
      <ul className="answer_label">
        <li>Answered</li>
        <li>Un-answered</li>
        <li>Not visited</li>
        <li>Mark as Review</li>
      </ul>
      <div className="rounded_navs">
        {filteredQuestions.map((question, index) => {
          const isAnswered = userAnswers[question.id] !== undefined;
          const isVisited = visitedQuestions[question.id] !== undefined;
          const isMarked = markedQuestions[question.id] !== undefined;

          let buttonColor = "bg-[#B19CBE]";
          if (isAnswered) {
            buttonColor = "bg-[var(--primery)]";
          } else if (isVisited) {
            buttonColor = "bg-[#e49331]";
          }
          if (isMarked) {
            buttonColor = "bg-[#498FE0]";
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