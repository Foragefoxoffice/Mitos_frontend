"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Notification from "@/components/Notification";
import {
  fetchQuestions,
  fetchQuestionsByTypes,
  checkFavoriteStatus,
  addFavoriteQuestion,
  removeFavoriteQuestion,
  getQuestionsBySubjectAndQuestionId,
  getQuestionsBySubjectAndChapterId,
  reportWrongQuestion,
} from "@/utils/api";
import { useSelectedTopics } from "@/contexts/SelectedTopicsContext";
import { useSelectedQuestionTypes } from "@/contexts/SelectedQuestionTypesContext";
import PracticeNavbar from "@/components/user/practicenavbar";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { FaHeart, FaRegHeart, FaFlag } from "react-icons/fa";
import DOMPurify from "dompurify";
import ImagePopup from "@/components/ImagePopup";

const HtmlWithMath = ({ html }) => {
  const cleanHtml = DOMPurify.sanitize(html);
  return (
    <MathJax inline dynamic>
      <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </MathJax>
  );
};

export default function TestPage() {
  const { selectedTopics } = useSelectedTopics();
  const { selectedQuestionTypes, chapterId, subjectId } =
    useSelectedQuestionTypes();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState({});
  const [questionLimit, setQuestionLimit] = useState(null);
  const [showQuantityPopup, setShowQuantityPopup] = useState(true);
  const [showNoQuestionsPopup, setShowNoQuestionsPopup] = useState(false);
  const [lastQuestionAttempted, setLastQuestionAttempted] = useState(false);
  const [hasCheckedQuestions, setHasCheckedQuestions] = useState(false);
  const [favoriteQuestions, setFavoriteQuestions] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [imagePopup, setImagePopup] = useState({
    show: false,
    src: "",
  });
  const [reportModal, setReportModal] = useState({
    show: false,
    reason: "",
    questionId: null,
  });
  const router = useRouter();
  const navButtonRefs = useRef([]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (navButtonRefs.current[currentQuestionIndex]) {
      navButtonRefs.current[currentQuestionIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        setHasCheckedQuestions(false);

        let questionsByTopics = [];
        let questionsByTypes = [];
        let questionsBySubjectAndType = [];
        let questionsBySubjectAndChapter = [];

        if (selectedTopics.length > 0) {
          const responseTopics = await fetchQuestions(selectedTopics);
          questionsByTopics = responseTopics?.data || [];
        }

        if (chapterId && selectedQuestionTypes.length > 0) {
          const responseTypes = await fetchQuestionsByTypes(
            selectedQuestionTypes,
            chapterId
          );
          questionsByTypes = responseTypes?.data || [];
        }

        if (subjectId && selectedQuestionTypes.length > 0) {
          const res = await getQuestionsBySubjectAndQuestionId(
            subjectId,
            selectedQuestionTypes
          );
          questionsBySubjectAndType = res?.data || [];
        }

        if (subjectId && chapterId) {
          const res = await getQuestionsBySubjectAndChapterId(
            subjectId,
            chapterId
          );
          questionsBySubjectAndChapter = res?.data || [];
        }

        const allQuestions = [
          ...questionsByTopics,
          ...questionsByTypes,
          ...questionsBySubjectAndType,
          ...questionsBySubjectAndChapter,
        ].filter(
          (question, index, self) =>
            index === self.findIndex((q) => q.id === question.id)
        );

        if (allQuestions.length === 0) {
          setError("No questions found for the selected criteria.");
        }

        const formattedQuestions = allQuestions.map((question) => ({
          id: question.id,
          question: question.question,
          options: [
            question.optionA,
            question.optionB,
            question.optionC,
            question.optionD,
          ],
          correctOption: question.correctOption,
          hint: question.hint,
          image: question.image,
          hintImage: question.hintImage,
        }));

        setQuestions(formattedQuestions);

        const favorites = {};
        formattedQuestions.forEach((q) => {
          favorites[q.id] = false;
        });
        setFavoriteQuestions(favorites);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError("Unable to load questions. Please try again later.");
      } finally {
        setLoading(false);
        setHasCheckedQuestions(true);
      }
    };

    loadQuestions();
  }, [selectedTopics, selectedQuestionTypes, subjectId, chapterId]);

  const checkFavorites = useCallback(async () => {
    if (questions.length > 0 && token && userId) {
      try {
        const response = await checkFavoriteStatus(userId, token);
        const favoriteStatus = {};

        questions.forEach((question) => {
          favoriteStatus[question.id] = false;
        });

        response.data.forEach((favQuestion) => {
          favoriteStatus[favQuestion.questionId] = true;
        });

        setFavoriteQuestions(favoriteStatus);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    }
  }, [questions, token, userId]);

  useEffect(() => {
    checkFavorites();
  }, [checkFavorites]);

  const toggleFavorite = useCallback(
    async (questionId) => {
      try {
        const isCurrentlyFavorite = favoriteQuestions[questionId];
        let success = false;

        if (isCurrentlyFavorite) {
          success = await removeFavoriteQuestion(userId, questionId, token);
        } else {
          success = await addFavoriteQuestion(userId, questionId, token);
        }

        if (success) {
          setFavoriteQuestions((prev) => ({
            ...prev,
            [questionId]: !isCurrentlyFavorite,
          }));

          setNotification({
            show: true,
            message: isCurrentlyFavorite
              ? "Question removed from favorites"
              : "Question added to Favorite",
            type: "success",
          });

          setTimeout(() => {
            setNotification((prev) => ({ ...prev, show: false }));
          }, 3000);

          return true;
        } else {
          setNotification({
            show: true,
            message: "Operation failed. Please try again.",
            type: "error",
          });
          return false;
        }
      } catch (error) {
        console.error("Error updating favorite status:", error);
        setNotification({
          show: true,
          message: "An error occurred. Please try again.",
          type: "error",
        });
        return false;
      }
    },
    [token, userId, favoriteQuestions]
  );

  const handleReportQuestion = async () => {
    try {
      if (!reportModal.questionId || !reportModal.reason.trim()) {
        setNotification({
          show: true,
          message: "Please provide a reason for reporting",
          type: "error",
        });
        return;
      }

      await reportWrongQuestion(reportModal.questionId, reportModal.reason);
      
      setNotification({
        show: true,
        message: "Question reported successfully. Thank you for your feedback!",
        type: "success",
      });
      
      setReportModal({ show: false, reason: "", questionId: null });
    } catch (error) {
      console.error("Error reporting question:", error);
      setNotification({
        show: true,
        message: "Failed to report question. Please try again.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (hasCheckedQuestions && !loading) {
      if (questions.length === 0) {
        setShowNoQuestionsPopup(true);
        const timer = setTimeout(() => {
          router.push("/user/dashboard");
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        setShowNoQuestionsPopup(false);
      }
    }
  }, [questions, loading, hasCheckedQuestions, router]);

  useEffect(() => {
    if (questionLimit !== null && questions.length > 0) {
      const limit =
        questionLimit === "full"
          ? questions.length
          : Math.min(parseInt(questionLimit), questions.length);
      setFilteredQuestions(questions.slice(0, limit));
      setCurrentQuestionIndex(0);
    }
  }, [questionLimit, questions]);

  const generateQuestionLimits = (totalQuestions) => {
    if (totalQuestions === 0) return [];

    const limits = new Set();

    if (totalQuestions <= 10) {
      return ["full"];
    }

    if (totalQuestions <= 180) {
      const step = totalQuestions <= 40 ? 10 : totalQuestions <= 80 ? 20 : 30;
      for (let i = step; i < totalQuestions; i += step) {
        limits.add(i);
      }
      limits.add("full");
    } else {
      const step = 30;
      for (let i = step; i < 180; i += step) {
        limits.add(i);
      }
      limits.add(180);
    }

    return Array.from(limits).sort((a, b) => {
      if (a === "full") return 1;
      if (b === "full") return -1;
      return a - b;
    });
  };

  const handleAnswer = (questionId, answerLabel) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answerLabel }));
    setVisitedQuestions((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      const nextQuestionId = filteredQuestions[currentQuestionIndex + 1].id;
      setVisitedQuestions((prev) => ({ ...prev, [nextQuestionId]: true }));
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      const prevQuestionId = filteredQuestions[currentQuestionIndex - 1].id;
      setVisitedQuestions((prev) => ({ ...prev, [prevQuestionId]: true }));
    }
  };

  const handleSubmit = () => {
    router.push("/user/dashboard");
  };

  const handleLimitSelection = (limit) => {
    setQuestionLimit(limit);
    setShowQuantityPopup(false);
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index);
    const questionId = filteredQuestions[index].id;
    setVisitedQuestions((prev) => ({ ...prev, [questionId]: true }));
  };

  const renderOptionButtons = (question) => {
    if (!question) return null;

    return question.options.map((option, index) => {
      const optionLabels = ["A", "B", "C", "D"];
      const currentOptionLabel = optionLabels[index];
      const isSelected = userAnswers[question.id] === currentOptionLabel;
      const isCorrect = question.correctOption === currentOptionLabel;
      const isWrong = isSelected && !isCorrect;
      const isCorrectOption = question.correctOption === currentOptionLabel;

      let buttonClass =
        "flex items-center gap-2 w-full text-left p-2 rounded-lg border ";

      if (isSelected) {
        if (isCorrect) {
          buttonClass += "bg-green-500 text-white";
        } else {
          buttonClass += "bg-red-500 text-white";
        }
      } else if (isCorrectOption && userAnswers[question.id]) {
        buttonClass += "bg-green-500 text-white";
      } else {
        buttonClass += "bg-[#FAF5FF] border border-[#C5B5CE]";
      }

      return (
        <button
          key={index}
          onClick={() => handleAnswer(question.id, currentOptionLabel)}
          className={buttonClass}
        >
          <span className="font-bold option_label">{currentOptionLabel}</span>
          <HtmlWithMath html={option} />
        </button>
      );
    });
  };

  const questionLimits = generateQuestionLimits(questions.length);

  return (
    <MathJaxContext
      config={{
        loader: { load: ["input/tex", "output/chtml"] },
        tex: {
          packages: { "[+]": ["color", "mhchem"] },
          inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"],
          ],
          displayMath: [
            ["$$", "$$"],
            ["\\[", "\\]"],
          ],
        },
      }}
    >
      <div className="container pt-6">
        {showNoQuestionsPopup && questions.length === 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
            <div className="question_popup">
              <h2>No Questions Available</h2>
              <p className="text-center">
                You will be redirected to the dashboard shortly.
              </p>
            </div>
          </div>
        )}

        {showQuantityPopup && questions.length > 0 && !showNoQuestionsPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
            <div className="question_popup">
              <h2>Select Number Of Questions</h2>
              {questionLimits.map((limit, index) => (
                <label key={index} className="flex items-center gap-2 p-2">
                  <input
                    type="radio"
                    name="questionLimit"
                    value={limit}
                    onChange={() => handleLimitSelection(limit)}
                    className="form-radio"
                  />
                  <span className="text-gray-800">
                    {limit === "full"
                      ? ` Practice full chapter (${questions.length} Questions)`
                      : `${limit} Questions`}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {reportModal.show && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
            <div className="question_popup p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Report Question</h2>
              <p className="mb-4">Please explain what's wrong with this question:</p>
              
              <textarea
                value={reportModal.reason}
                onChange={(e) => setReportModal(prev => ({...prev, reason: e.target.value}))}
                className="w-full p-2 border text-black rounded mb-4"
                rows={4}
                placeholder="Enter your reason for reporting..."
              />
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setReportModal({ show: false, reason: "", questionId: null })}
                  className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportQuestion}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="test_nav">
          <PracticeNavbar />
        </div>

        {filteredQuestions.length > 0 && (
          <div className="test_containerss">
            <div className="question-navigation mb-4 navborders overflow-x-auto m-auto w-full md:w-[70%] scroll-smooth">
              <div className="flex gap-2 m-3 p-2 rounded-lg min-w-max">
                {filteredQuestions.map((question, index) => {
                  const isCurrent = currentQuestionIndex === index;
                  const isVisited = visitedQuestions[question.id];
                  const isAnswered = userAnswers[question.id];
                  const isCorrect =
                    isAnswered &&
                    userAnswers[question.id] === question.correctOption;

                  let buttonClass =
                    "min-w-[40px] h-10 rounded-full flex items-center justify-center transition duration-300 shadow-sm hover:scale-105";

                  if (isCurrent) {
                    buttonClass += " bg-[#e49331] text-white";
                  } else if (isAnswered) {
                    buttonClass += isCorrect
                      ? " bg-green-500 text-white"
                      : " bg-red-500 text-white";
                  } else if (isVisited) {
                    buttonClass += " bg-[#e49331]";
                  } else {
                    buttonClass += " bg-[#B19CBE]";
                  }

                  return (
                    <button
                      key={index}
                      ref={(el) => (navButtonRefs.current[index] = el)}
                      onClick={() => handleQuestionNavigation(index)}
                      className={buttonClass}
                      aria-label={`Question ${index + 1}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="test_container1 m-auto">
              <div className="flex justify-between items-center">
                <h2 className="">
                  Question {currentQuestionIndex + 1} /{" "}
                  {filteredQuestions.length}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReportModal({
                      show: true,
                      reason: "",
                      questionId: filteredQuestions[currentQuestionIndex].id
                    })}
                    className="p-2 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center gap-1"
                    title="Report this question"
                  >
                    <FaFlag className="w-4 h-4" />
                    <span className="hidden sm:inline">Report</span>
                  </button>
                  <button
                    onClick={() =>
                      toggleFavorite(filteredQuestions[currentQuestionIndex].id)
                    }
                    className="p-2 rounded-full bg-transparent transition duration-200"
                    aria-label={
                      favoriteQuestions[
                        filteredQuestions[currentQuestionIndex].id
                      ]
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    {favoriteQuestions[
                      filteredQuestions[currentQuestionIndex].id
                    ] ? (
                      <FaHeart className="text-red-500 w-6 h-6" />
                    ) : (
                      <FaRegHeart className="text-black w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>

              <div className="question-content">
                <HtmlWithMath
                  html={filteredQuestions[currentQuestionIndex].question}
                />
              </div>

              {filteredQuestions[currentQuestionIndex].image && (
                <img
                  src={`https://mitoslearning.in/${filteredQuestions[currentQuestionIndex].image}`}
                  alt="Question illustration"
                  className="max-w-full h-auto my-4 cursor-zoom-in"
                  onClick={() =>
                    setImagePopup({
                      show: true,
                      src: `https://mitoslearning.in/${filteredQuestions[currentQuestionIndex].image}`,
                    })
                  }
                />
              )}

              <div className="option_btns space-y-2">
                {renderOptionButtons(filteredQuestions[currentQuestionIndex])}
              </div>

              {userAnswers[filteredQuestions[currentQuestionIndex].id] && (
                <div className="mt-4 hint-section">
                  <p className="text-green-500 font-semibold">
                    Correct Answer:{" "}
                    {filteredQuestions[currentQuestionIndex].correctOption}
                  </p>

                  {filteredQuestions[currentQuestionIndex].hint && (
                    <div className="mt-2">
                      <p className="text-red-500 font-semibold">Hint:</p>
                      {filteredQuestions[currentQuestionIndex].hintImage && (
                        <img
                          src={`https://mitoslearning.in/${filteredQuestions[currentQuestionIndex].hintImage}`}
                          alt="Hint illustration"
                          className="max-w-full h-auto my-2 cursor-zoom-in"
                          onClick={() =>
                            setImagePopup({
                              show: true,
                              src: `https://mitoslearning.in/${filteredQuestions[currentQuestionIndex].hintImage}`,
                            })
                          }
                        />
                      )}
                      <HtmlWithMath
                        html={filteredQuestions[currentQuestionIndex].hint}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="nav_btns flex justify-between mt-6">
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </button>
                {currentQuestionIndex === filteredQuestions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Try another set of questions
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {lastQuestionAttempted && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
            <div className="question_popup grid place-content-center gap-6">
              <h3>Try another set of questions</h3>
              <button onClick={handleSubmit} className="btn">
                Click Here
              </button>
            </div>
          </div>
        )}

        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() =>
              setNotification((prev) => ({ ...prev, show: false }))
            }
          />
        )}
        {imagePopup.show && (
          <ImagePopup
            src={imagePopup.src}
            onClose={() => setImagePopup({ show: false, src: "" })}
          />
        )}
      </div>
    </MathJaxContext>
  );
}