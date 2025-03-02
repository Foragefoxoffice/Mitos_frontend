"use client";
import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchFullTestQuestion, fetchFullTestByPortion,fetchFullTestBySubject,fetchFullTestByChapter ,fetchCustomTestQuestions } from "@/utils/api";
import TestNavbar from "@/components/user/testnavbar";
import { TestContext } from "@/contexts/TestContext";

export default function TestPage() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState({});
  const [showInstructionPopup, setShowInstructionPopup] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();
  const { testData } = useContext(TestContext);
  const portionId = testData?.portionId;
  const subjectId = testData?.subjectId;
  const chapterId= testData?.chapterId;
const topicIds=testData?.topics;
const questionCount=testData?.questionCount;
const [token, setToken] = useState(null);

useEffect(() => {
  if (typeof window !== "undefined") {
    setToken(localStorage.getItem("token"));
  }
}, []);

console.log('topics', topicIds);
  const totalTime = useMemo(() => questions.length * 60, [questions.length]);

  useEffect(() => {
    if (!showInstructionPopup && !showResults && questions.length > 0) {
      setTimeLeft(totalTime);

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 0) {
            return prev - 1;
          } else {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showInstructionPopup, showResults, questions, totalTime]);

  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }, []);

  useEffect(() => {
    const handleError = (message) => {
      setError(message);
      setLoading(false);
      throw new Error(message); // Stop execution by throwing an error
    };
  
    const loadQuestions = async () => {
      try {
        // Validate testData
        if (!testData) {
          return handleError("Test data is not available. Please go back and try again.");
        }
  
        let testQuestions = [];
  
        // Fetch questions based on test type
        switch (testData.testname) {
          case "full-portion":
            testQuestions = (await fetchFullTestQuestion())?.data || [];
            break;
  
          case "portion-full-test":
            if (!portionId) return handleError("Portion ID is missing. Please go back and try again.");
            testQuestions = (await fetchFullTestByPortion(portionId))?.data || [];
            break;
  
          case "subject-full-test":
            if (!portionId || !subjectId) return handleError("Portion ID or Subject ID is missing. Please go back and try again.");
            testQuestions = (await fetchFullTestBySubject(portionId, subjectId))?.data || [];
            break;
  
          case "Chapter-full-test":
            if (!portionId || !subjectId || !chapterId) return handleError("Portion ID, Subject ID, or Chapter ID is missing. Please go back and try again.");
            testQuestions = (await fetchFullTestByChapter(portionId, subjectId, chapterId))?.data || [];
            break;
  
          case "topics-custom-test":
            if (!portionId || !subjectId || !chapterId || !topicIds?.length || !questionCount) {
              return handleError("Portion ID, Subject ID, Chapter ID, or Topic IDs are missing. Please go back and try again.");
            }
  
            // Fetch custom test questions
            const customQuestions = await fetchCustomTestQuestions(portionId, subjectId, chapterId, topicIds, questionCount);
            console.log("Fetched Custom Test Questions:", customQuestions); // Log the fetched questions
            testQuestions = customQuestions || []; // Use the response directly (no need for .data)
            break;
  
          default:
            return handleError("Invalid test type. Please go back and try again.");
        }
  
        // Remove duplicate questions based on ID
        const deduplicatedQuestions = testQuestions.filter(
          (question, index, self) => index === self.findIndex((q) => q.id === question.id)
        );
  
        // Format questions before setting state
        const formattedQuestions = deduplicatedQuestions.map((question) => ({
          id: question.id || "N/A",
          question: question.question || "No question text available",
          image: question.image || null,
          options: [
            question.optionA || "Option A",
            question.optionB || "Option B",
            question.optionC || "Option C",
            question.optionD || "Option D",
          ],
          correctOption: question.correctOption || "N/A",
          hint: question.hint || "No hint available",
          type: question.questionTypeId ? `Type ${question.questionTypeId}` : "Unknown", // Map questionTypeId to a string
          subject: question.subjectId ? `Subject ${question.subjectId}` : "Unknown", // Map subjectId to a string
          chapter: question.chapterId ? `Chapter ${question.chapterId}` : "Unknown", // Map chapterId to a string
        }));
  
        setQuestions(formattedQuestions);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError("Unable to load questions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    loadQuestions();
  }, [testData, portionId, subjectId, chapterId, topicIds, questionCount]);


  const handleAnswer = useCallback((questionId, answer) => {
    const label = answer.split(" ")[1];
    setUserAnswers((prev) => ({ ...prev, [questionId]: label }));
    setVisitedQuestions((prev) => ({ ...prev, [questionId]: true }));
  }, []);

  const toggleMarkAsReview = useCallback((questionId) => {
    setMarkedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
    setVisitedQuestions((prev) => ({
      ...prev,
      [questionId]: true,
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      const nextQuestionId = questions[currentQuestionIndex + 1].id;
      setVisitedQuestions((prev) => ({ ...prev, [nextQuestionId]: true }));
    }
  }, [currentQuestionIndex, questions]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      const prevQuestionId = questions[currentQuestionIndex - 1].id;
      setVisitedQuestions((prev) => ({ ...prev, [prevQuestionId]: true }));
    }
  }, [currentQuestionIndex, questions]);

  const handleQuestionNavigation = useCallback((index) => {
    setCurrentQuestionIndex(index);
    const questionId = questions[index].id;
    setVisitedQuestions((prev) => ({ ...prev, [questionId]: true }));
  }, [questions]);

  const renderOptionButtons = useCallback((question) => {
    return question.options.map((option, index) => {
      const isSelected = userAnswers[question.id] === option.split(" ")[1];
      const optionLabels = ["A", "B", "C", "D"];
      const currentOptionLabel = optionLabels[index];

      let buttonClass = "flex items-center gap-2 w-full text-left p-2 rounded-lg border ";

      if (isSelected) {
        buttonClass += "text-white bg-[#6712B7] ";
      } else {
        buttonClass += "bg-[#FAF5FF] text-[#282C35] border: 1px solid #C5B5CE";
      }

      return (
        <button
          key={index}
          onClick={() => handleAnswer(question.id, option)}
          className={buttonClass}
        >
          <span className="font-bold">{currentOptionLabel}</span>
          <div>{option}</div>
        </button>
      );
    });
  }, [handleAnswer, userAnswers]);

  const calculateScore = useCallback(() => {
    let score = 0;
    questions.forEach((question) => {
      if (userAnswers[question.id] === question.correctOption) {
        score += 4;
      } else if (userAnswers[question.id] !== undefined) {
        score -= 1;
      }
    });
    return score;
  }, [questions, userAnswers]);

  const calculateCorrectAnswers = useCallback(() => {
    let correctCount = 0;
    questions.forEach((question) => {
      if (userAnswers[question.id] === question.correctOption) {
        correctCount++;
      }
    });
    return correctCount;
  }, [questions, userAnswers]);

  const calculateWrongAnswers = useCallback(() => {
    let wrongCount = 0;
    questions.forEach((question) => {
      if (userAnswers[question.id] && userAnswers[question.id] !== question.correctOption) {
        wrongCount++;
      }
    });
    return wrongCount;
  }, [questions, userAnswers]);

  const calculateAccuracy = useCallback(() => {
    const correctAnswers = questions.filter(
      (question) => userAnswers[question.id] === question.correctOption
    ).length;
    const totalAnswered = Object.keys(userAnswers).length;
    return totalAnswered === 0 ? 0 : Math.round((correctAnswers / totalAnswered) * 100);
  }, [questions, userAnswers]);

  const calculateResultsByType = useCallback(() => {
    const resultsByType = {};

    questions.forEach((question) => {
      const type = question.type;
      const subject = question.subject;

      if (userAnswers[question.id] !== undefined) {
        if (!resultsByType[type]) {
          resultsByType[type] = {
            attempted: 0,
            correct: 0,
            wrong: 0,
            subjects: {},
          };
        }

        if (!resultsByType[type].subjects[subject]) {
          resultsByType[type].subjects[subject] = {
            attempted: 0,
            correct: 0,
            wrong: 0,
          };
        }

        resultsByType[type].attempted += 1;
        resultsByType[type].subjects[subject].attempted += 1;

        if (userAnswers[question.id] === question.correctOption) {
          resultsByType[type].correct += 1;
          resultsByType[type].subjects[subject].correct += 1;
        } else {
          resultsByType[type].wrong += 1;
          resultsByType[type].subjects[subject].wrong += 1;
        }
      }
    });

    return resultsByType;
  }, [questions, userAnswers]);

  const calculateResultsByChapter = useCallback(() => {
    const resultsByChapter = {};

    questions.forEach((question) => {
      const chapter = question.chapter;
      const subject = question.subject;

      if (userAnswers[question.id] !== undefined) {
        if (!resultsByChapter[chapter]) {
          resultsByChapter[chapter] = {
            attempted: 0,
            correct: 0,
            wrong: 0,
            subjects: subject,
          };
        }

        resultsByChapter[chapter].attempted += 1;

        if (userAnswers[question.id] === question.correctOption) {
          resultsByChapter[chapter].correct += 1;
        } else {
          resultsByChapter[chapter].wrong += 1;
        }
      }
    });

    return resultsByChapter;
  }, [questions, userAnswers]);

  const saveTestResult = async (resultData) => {
    try {
      
      const response = await fetch('http://localhost:5000/api/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(resultData),
      });

      if (!response.ok) {
        throw new Error('Failed to save test result');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving test result:', error);
      throw error;
    }
  };

  const handleSubmit = useCallback(async () => {
    const resultData = {
      userId: 1,
      score: calculateScore(),
      totalMarks: questions.length * 4,
      answered: Object.keys(userAnswers).length,
      correct: calculateCorrectAnswers(),
      wrong: calculateWrongAnswers(),
      unanswered: questions.length - Object.keys(userAnswers).length,
      accuracy: calculateAccuracy(),
      totalTimeTaken: formatTime(totalTime - timeLeft),
      resultsByType: calculateResultsByType(),
      resultsByChapter: calculateResultsByChapter(),
    };

    try {
      await saveTestResult(resultData);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to save test result:', error);
      setError('Failed to save test result. Please try again.');
    }
  }, [calculateScore, calculateCorrectAnswers, calculateWrongAnswers, calculateAccuracy, calculateResultsByType, calculateResultsByChapter, questions.length, userAnswers, totalTime, timeLeft]);

  if (loading) {
    return <div className="container pt-6">Loading questions...</div>;
  }

  if (error) {
    return <div className="container pt-6 text-red-500">{error}</div>;
  }

  if (questions.length === 0 && !loading) {
    return <div className="container pt-6">No questions available.</div>;
  }

  return (
    <div className="container pt-6">
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

      {questions.length > 0 && !showInstructionPopup && !showResults && (
        <div className="test_containers">
          <div className="test_container1">
            <div className="flex justify-between items-center ">
              <p className="mt-2 flex items-center gap-2"><img width={30} src="/images/icons/time.png" /> <span className="text-[#FF0000] text-xl">{formatTime(timeLeft)} MIN</span></p>
              <button
                onClick={handleSubmit}
                className="btn"
                style={{ padding: "0.5rem 3rem" }}
              >
                Submit
              </button>
            </div>
            <h2 className="">
              Question {currentQuestionIndex + 1} / {questions.length}
            </h2>
              <p className="mt-2">{questions[currentQuestionIndex].subject}</p>
            <p className="mt-2">{questions[currentQuestionIndex].question}</p>
            {questions[currentQuestionIndex].image && (
              <img src={questions[currentQuestionIndex].image} alt="question_image" />
            )}
            <div className="option_btns">
              {renderOptionButtons(questions[currentQuestionIndex])}
            </div>

            <div className="nav_btns">
              <button
                onClick={handlePrevious}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button
                onClick={() => toggleMarkAsReview(questions[currentQuestionIndex].id)}
                className={`px-4 py-2 ${markedQuestions[questions[currentQuestionIndex].id]
                    ? "bg-yellow-500"
                    : "bg-gray-300"
                  } rounded hover:bg-yellow-600`}
              >
                {markedQuestions[questions[currentQuestionIndex].id]
                  ? "Unmark Review"
                  : "Mark as Review"}
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
              </button>
            </div>
          </div>

          <div className="test_container2">
            <ul className="answer_label">
              <li>Answered</li>
              <li>Un-answered</li>
              <li>Not visited</li>
            </ul>
            <div className="rounded_navs">
              {questions.map((question, index) => {
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

      {showResults && (
        <div className=" flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Test Results</h2>
            <div className="mb-4">
              <p className="mb-2">
                Your score: <span className="font-bold">{calculateScore()}</span> / {questions.length * 4}
              </p>
              <p className="mb-2">
                Answered Questions: <span className="font-bold">{Object.keys(userAnswers).length}</span>
              </p>
              <p className="mb-2">
                Correct Answered: <span className="font-bold">{calculateCorrectAnswers()}</span>
              </p>
              <p className="mb-2">
                Unanswered Questions: <span className="font-bold">{questions.length - Object.keys(userAnswers).length}</span>
              </p>
              <p className="mb-2">
                Wrong Answers: <span className="font-bold">{calculateWrongAnswers()}</span>
              </p>
              <p className="mb-2">
                Accuracy: <span className="font-bold">{calculateAccuracy()}%</span>
              </p>
              <p className="mb-2">
                Total Time Taken: <span className="font-bold">{formatTime(totalTime - timeLeft)}</span>
              </p>

            </div>

          {/* Results by Question Type */}
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2">Results by Question Type</h3>
        {Object.entries(calculateResultsByType()).map(([type, metrics]) => (
  <div key={type} className="mb-4">
    <h4 className="font-semibold">{type}</h4>
    <p>Attempted: {metrics.attempted}</p>
    <p>Correct: {metrics.correct}</p>
    <p>Wrong: {metrics.wrong}</p>

  </div>
))}
      </div>

            <button
              onClick={() => router.push("/user/practice")}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Go Back to Practice1
            </button>
          </div>
        </div>
      )}
    </div>
  );
}