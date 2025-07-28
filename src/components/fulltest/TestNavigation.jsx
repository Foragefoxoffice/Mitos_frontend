"use client";
import React from "react";

export const TestNavigation = ({
  currentQuestionIndex,
  filteredQuestions = [],
  handlePrevious,
  handleNext,
  toggleMarkAsReview,
  markedQuestions = {},
  question,
  getUniqueSubjects = [],
  subjectFilter,
  onShowAnswers,
}) => {
  // Get current subject position in the predefined order
  const subjectOrder = ["Physics", "Chemistry", "Biology"]; // Add all your subjects in order
  const sortedSubjects = [...getUniqueSubjects].sort((a, b) => 
    subjectOrder.indexOf(a.name) - subjectOrder.indexOf(b.name)
  );

  const currentSubjectIndex = subjectFilter 
    ? sortedSubjects.findIndex(subj => subj.id === subjectFilter)
    : -1;

  // Strict forward navigation conditions
  const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;
  const hasNextSubject = currentSubjectIndex < sortedSubjects.length - 1;
  
  // Button text and behavior
  let nextButtonText = "Next";
  let nextAction = handleNext;
  
  if (isLastQuestion) {
    if (hasNextSubject) {
      nextButtonText = `Next: ${sortedSubjects[currentSubjectIndex + 1].name}`;
    } else if (subjectFilter) {
      nextButtonText = "All Subjects";
    }
  }

  // Disable next button only when at absolute end
  const disableNextButton = filteredQuestions.length === 0 || 
                         (isLastQuestion && !hasNextSubject && !subjectFilter);

  return (
    <div className="nav_btns">
      <button
        onClick={handlePrevious}
        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        disabled={currentQuestionIndex === 0}
      >
        Previous
      </button>
      
      {onShowAnswers === false && (
        <button
          onClick={() => toggleMarkAsReview(question?.id)}
          className={`px-4 py-2 ${
            markedQuestions[question?.id] ? "bg-yellow-500" : "bg-gray-300"
          } rounded hover:bg-yellow-600`}
        >
          {markedQuestions[question?.id] ? "Unmark Review" : "Mark as Review"}
        </button>
      )}
      
      <button
        onClick={nextAction}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={disableNextButton}
      >
        {nextButtonText}
      </button>
    </div>
  );
};