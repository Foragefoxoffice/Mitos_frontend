"use client";
import React, { useCallback } from "react";
import DOMPurify from "dompurify";
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

// Helper component to render HTML with MathJax support
const HtmlWithMath = ({ html }) => {
  // Sanitize the HTML first
  const cleanHtml = DOMPurify.sanitize(html);
  
  return (
    <MathJax inline dynamic>
      <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </MathJax>
  );
};

export const TestQuestion = ({
  question,
  userAnswers,
  handleAnswer,
  currentQuestionIndex,
  filteredQuestions,
  toggleFavorite,
  isFavorite
}) => {
  const renderOptionButtons = useCallback(
    (question) => {
      return question.options.map((option, index) => {
        const optionLabels = ["A", "B", "C", "D"];
        const currentOptionLabel = optionLabels[index];
        
        const isSelected = userAnswers[question.id] === currentOptionLabel;
  
        let buttonClass = "flex items-start gap-2 w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 ";
  
        if (isSelected) {
          buttonClass += "text-white bg-[#6712B7] border-[#6712B7] selected";
        } else {
          buttonClass += "bg-[#FAF5FF] text-[#282C35] border border-[#C5B5CE]";
        }
  
        return (
          <button
            key={index}
            onClick={() => handleAnswer(question.id, currentOptionLabel)}
            className={buttonClass}
          >
            <span className="font-bold option_label min-w-[1.5rem]">
              {currentOptionLabel}
            </span>
            <div className="flex-1 question_option">
              <HtmlWithMath html={option} />
            </div>
          </button>
        );
      });
    },
    [handleAnswer, userAnswers]
  );
  
  return (
    <MathJaxContext 
      config={{ 
        loader: { load: ["input/tex", "output/chtml"] },
        tex: {
          packages: {'[+]': ['color', 'mhchem']},
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
        }
      }}
    >
      <div className="flex gap-4 items-center py-4">
        <h2 className="text-lg font-semibold mb-2">
          Question {currentQuestionIndex + 1} / {filteredQuestions.length}
        </h2>
        <button
          onClick={() => toggleFavorite(question.id)}
          className="p-2 rounded-full bg-transparent transition duration-200"
        >
          {isFavorite ? (
            <FaHeart className="text-red-500 w-6 h-6" />
          ) : (
            <FaRegHeart className="text-black w-6 h-6" />
          )}
        </button>
      </div>
      
      <div className="mb-4 question_option">
        <HtmlWithMath html={question.question} />
      </div>
      {question.image && (
        <img
          alt=""
          src={`https://mitoslearning.in//${question.image}`}
          className="max-w-full h-auto my-4 rounded"
        />
      )}
      <div className="option_btns flex flex-col gap-3">
        {renderOptionButtons(question)}
      </div>
    </MathJaxContext>
  );
};  