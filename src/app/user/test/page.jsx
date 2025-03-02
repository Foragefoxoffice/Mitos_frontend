"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchQuestions, fetchQuestionsByTypes } from "@/utils/api";
import { useSelectedTopics } from "@/contexts/SelectedTopicsContext";
import { useSelectedQuestionTypes } from "@/contexts/SelectedQuestionTypesContext";
import TestNavbar from "@/components/user/testnavbar";

export default function TestPage() {
  const { selectedTopics } = useSelectedTopics();
  const { selectedQuestionTypes, chapterId } = useSelectedQuestionTypes();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState({}); // Track visited questions
  const [questionLimit, setQuestionLimit] = useState(null);
  const [showQuantityPopup, setShowQuantityPopup] = useState(true);
  const [showInstructionPopup, setShowInstructionPopup] = useState(false);
  const router = useRouter();
  const ChapterId = chapterId;

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        if (selectedTopics.length > 0 || selectedQuestionTypes.length > 0) {
          let questionsByTopics = [];
          let questionsByTypes = [];

          if (selectedTopics.length > 0) {
            const responseTopics = await fetchQuestions(selectedTopics);
            questionsByTopics = responseTopics?.data || [];
          }

          if (selectedQuestionTypes.length > 0) {
            const responseTypes = await fetchQuestionsByTypes(selectedQuestionTypes, ChapterId);
            questionsByTypes = responseTypes?.data || [];
          }

          const minLength = Math.min(questionsByTopics.length, questionsByTypes.length);
          const balancedQuestions = [];

          for (let i = 0; i < minLength; i++) {
            balancedQuestions.push(questionsByTopics[i], questionsByTypes[i]);
          }

          const remainingQuestions = [
            ...questionsByTopics.slice(minLength),
            ...questionsByTypes.slice(minLength),
          ];

          for (let i = remainingQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remainingQuestions[i], remainingQuestions[j]] = [remainingQuestions[j], remainingQuestions[i]];
          }

          const finalQuestions = [...balancedQuestions, ...remainingQuestions];

          const deduplicatedQuestions = finalQuestions.filter(
            (question, index, self) =>
              index === self.findIndex((q) => q.id === question.id)
          );

          const formattedQuestions = deduplicatedQuestions.map((question) => ({
            id: question.id,
            question: question.question,
            options: [question.optionA, question.optionB, question.optionC, question.optionD],
            correctOption: question.correctOption,
            hint: question.hint,
          }));

          setQuestions(formattedQuestions);
        } else {
          setError("No topics or question types selected. Please go back and select.");
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError("Unable to load questions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [selectedTopics, selectedQuestionTypes]);

  useEffect(() => {
    if (questionLimit !== null) {
      const limit = questionLimit === "full" ? questions.length : parseInt(questionLimit);
      setFilteredQuestions(questions.slice(0, limit));
      setCurrentQuestionIndex(0);
    }
  }, [questionLimit, questions]);

  const generateQuestionLimits = (totalQuestions) => {
    const limits = [];
    const step = totalQuestions <= 40 ? 10 : totalQuestions <= 50 ? 15 : 20;

    for (let i = step; i < totalQuestions; i += step) {
      limits.push(i);
    }

    limits.push("full");
    return limits;
  };

  const handleAnswer = (questionId, answer) => {
    setUserAnswers({ ...userAnswers, [questionId]: answer });
    // Mark the question as visited when answered
    setVisitedQuestions((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      // Mark the next question as visited
      const nextQuestionId = filteredQuestions[currentQuestionIndex + 1].id;
      setVisitedQuestions((prev) => ({ ...prev, [nextQuestionId]: true }));
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      // Mark the previous question as visited
      const prevQuestionId = filteredQuestions[currentQuestionIndex - 1].id;
      setVisitedQuestions((prev) => ({ ...prev, [prevQuestionId]: true }));
    }
  };

  const handleSubmit = () => {
    // console.log("User Answers:", userAnswers);
    // alert("Test submitted successfully!");
    router.push("/user/practice");
  };

  const handleLimitSelection = (limit) => {
    setQuestionLimit(limit);
    setShowQuantityPopup(false);
    setShowInstructionPopup(true);
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index);
    // Mark the question as visited when navigated to
    const questionId = filteredQuestions[index].id;
    setVisitedQuestions((prev) => ({ ...prev, [questionId]: true }));
  };

  const questionLimits = generateQuestionLimits(questions.length);
  const renderOptionButtons = (question) => {
    return question.options.map((option, index) => {
      const isSelected = userAnswers[question.id] === option;
      const optionLabels = ["A", "B", "C", "D"];
      const currentOptionLabel = optionLabels[index]; // Get the label (A, B, C, D)
      const isCorrect = question.correctOption === currentOptionLabel; // Compare with the label
  
      // Determine if the user selected the wrong option
      const isWrong = isSelected && !isCorrect;
  
      // Determine if this option is the correct one (to highlight it when the user selects a wrong answer)
      const isCorrectOption = question.correctOption === currentOptionLabel;
  
      let buttonClass = "flex items-center gap-2 w-full text-left p-2 rounded-lg border ";
  
      if (isSelected) {
        if (isCorrect) {
          buttonClass += "bg-green-500 text-white"; // Correct answer
        } else {
          buttonClass += "bg-red-500 text-white"; // Incorrect answer
        }
      } else if (isCorrectOption && userAnswers[question.id]) {
        // Highlight the correct answer if the user has selected any option
        buttonClass += "bg-green-500 text-white"; // Correct answer (highlighted)
      } else {
        buttonClass += "bg-[#FAF5FF] border: 1px solid #C5B5CE"; // Default style
      }
  
      return (
        <button
          key={index}
          onClick={() => handleAnswer(question.id, option)}
          className={buttonClass}
        >
          <span className="font-bold">{currentOptionLabel}</span>
          <p>{option}</p>
        </button>
      );
    });
  };

  return (
    <div className="container pt-6">
      {showQuantityPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="question_popup">
            <h2>Select Number Of Questions</h2>
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
                    ? `Full Test (${questions.length} Questions)`
                    : `${limit} Questions`}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {showInstructionPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="question_popup">
            <h2>Test Instructions</h2>
            <ul>
              <li>Each question takes 1 minute, So total number of questions X 1min for total test time. (Time is for whole test)</li>
              <li>4 buttons for navigation “Previous question” “Mark for Review” “Next” “Questions”.</li>
              <li>Questions will have pop up box for navigating to any question.</li>
              <li>Attempted question – Green</li>
              <li>Left question – Red</li>
              <li>Unvisited question – Gray</li>
            </ul>
            <button
              className="btn mx-auto py-2"
              onClick={() => setShowInstructionPopup(false)}
            >
              Take your Test
            </button>
          </div>
        </div>
      )}

      <div className="test_nav">
        <TestNavbar />
      </div>

      {filteredQuestions.length > 0 && !showInstructionPopup && (
        <div className="test_containers">
          {/* Right Side: Current Question */}
          <div className="test_container1">
            <h2 className="">
              Question {currentQuestionIndex + 1} / {filteredQuestions.length}
            </h2>
            <p className="mt-2">{filteredQuestions[currentQuestionIndex].question}</p>
            <div className="option_btns">
              {renderOptionButtons(filteredQuestions[currentQuestionIndex])}
            </div>

            {userAnswers[filteredQuestions[currentQuestionIndex].id] &&
              userAnswers[filteredQuestions[currentQuestionIndex].id] !==
              filteredQuestions[currentQuestionIndex].correctOption && (
                <>
                  <p className="text-green-500 mt-2">
                    Correct Answer: {filteredQuestions[currentQuestionIndex].correctOption}
                  </p>
                  <p className="text-red-500 mt-2">
                    <span className="hint" >Hint:</span> {filteredQuestions[currentQuestionIndex].hint}
                  </p>
                </>
              )}

            <div className="nav_btns">
              <button
                onClick={handlePrevious}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={currentQuestionIndex === filteredQuestions.length - 1}
              >
                Next
              </button>
            </div>
          </div>

          {/* Left Side: Question Navigation */}
          <div className="test_container2">
            <ul className="answer_label">
              <li>Answered</li>
              <li>Un-answerd</li>
              <li>Not visited</li>
            </ul>
            <div className="rounded_navs">
              {filteredQuestions.map((question, index) => {
                const isAnswered = userAnswers[question.id] !== undefined;
                const isVisited = visitedQuestions[question.id] !== undefined;

                let buttonColor = "bg-[#B19CBE]"; // Default: Unvisited
                if (isAnswered) {
                  buttonColor = "bg-[var(--primery)]"; // Answered
                } else if (isVisited) {
                  buttonColor = "bg-[#e49331]"; // Visited but unanswered
                }

                return (
                  <button
                    key={question.id}
                    onClick={() => handleQuestionNavigation(index)}
                    className={`p-2 rounded-lg text-center ${buttonColor} text-white`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {currentQuestionIndex === filteredQuestions.length - 1 && (
         <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="question_popup grid place-content-center gap-6">
          <h3>Try anthor set of questions</h3>
        <button
          onClick={handleSubmit}
          className="btn"
        >
          Click Here
        </button>
        </div>
        </div>
      )}
    </div>
  );
}