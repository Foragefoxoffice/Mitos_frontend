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
import { motion } from "framer-motion";

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
    selectedOptions: [],
    additionalMessage: "",
    questionId: null,
  });

  const REPORT_OPTIONS = [
    "Wrong/Unclear Question",
    "Wrong/Unclear Option(s)",
    "Wrong/Blurry/No Image(s)",
    "Incorrect Answer Key",
    "Wrong/Unclear Solution",
  ];

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
      const { selectedOptions, additionalMessage, questionId } = reportModal;

      if (!questionId || selectedOptions.length === 0) {
        setNotification({
          show: true,
          message: "Please select at least one reason.",
          type: "error",
        });
        return;
      }

      const finalReason = `${selectedOptions.join(", ")}${additionalMessage ? ` | Details: ${additionalMessage}` : ""
        }`;

      await reportWrongQuestion(questionId, finalReason);

      setNotification({
        show: true,
        message: "Question reported successfully. Thank you!",
        type: "success",
      });

      setReportModal({
        show: false,
        selectedOptions: [],
        additionalMessage: "",
        questionId: null,
      });
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
      limits.add("full"); // Always allow full if <= 180
    } else {
      const step = 30;
      for (let i = step; i < 180; i += step) {
        limits.add(i);
      }
      limits.add(180);
      limits.add("full"); // Add full only if > 180
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
      "flex items-center gap-2 w-full text-left p-2 rounded-lg border m-0 transition-colors duration-200 ";

    if (isSelected) {
      if (isCorrect) {
        buttonClass += "bg-green-500 text-white border-green-500";
      } else {
        buttonClass += "bg-red-500 text-white border-red-500";
      }
    } else if (isCorrectOption && userAnswers[question.id]) {
      buttonClass += "bg-green-500 text-white border-green-500";
    } else {
      buttonClass += "bg-[#FAF5FF] border border-[#C5B5CE] hover:bg-gray-100";
    }

    return (
      <motion.div
        key={index}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        <button
          onClick={() => handleAnswer(question.id, currentOptionLabel)}
          className={buttonClass}
        >
          <span className="font-bold option_label">{currentOptionLabel}</span>
          <HtmlWithMath html={option} />
        </button>
      </motion.div>
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
                      ? `Practice Full Questions (${questions.length})`
                      : `${limit} Questions`}
                  </span>

                </label>
              ))}
            </div>
          </div>
        )}

        {reportModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[black/50] backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-2xl shadow-2xl p-6 bg-[#35095e] dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  🚨 Report Issue
                </h2>
                <button
                  onClick={() =>
                    setReportModal({
                      show: false,
                      selectedOptions: [],
                      additionalMessage: "",
                      questionId: null,
                    })
                  }
                  className="text-xl text-white p-2 py-0 rounded-full hover:text-red-500 transition"
                >
                  &times;
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                What seems to be the problem with this question? You can select multiple options.
              </p>

              {/* Issue Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {REPORT_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium cursor-pointer transition duration-150 hover:shadow-md ${reportModal.selectedOptions.includes(option)
                        ? "bg-purple-100 border-purple-500 dark:bg-purple-800/30"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={reportModal.selectedOptions.includes(option)}
                      onChange={(e) => {
                        const updatedOptions = e.target.checked
                          ? [...reportModal.selectedOptions, option]
                          : reportModal.selectedOptions.filter((o) => o !== option);
                        setReportModal((prev) => ({
                          ...prev,
                          selectedOptions: updatedOptions,
                        }));
                      }}
                      className="h-5 w-5 text-purple-600 accent-purple-600"
                    />
                    <span className="flex-1 text-white">{option}</span>
                  </label>
                ))}
              </div>

              {/* Additional Comments */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Additional Comments <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={reportModal.additionalMessage}
                  onChange={(e) =>
                    setReportModal((prev) => ({
                      ...prev,
                      additionalMessage: e.target.value,
                    }))
                  }
                  placeholder="Tell us anything else you noticed..."
                  rows={3}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 text-sm dark:bg-gray-800 bg-white text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() =>
                    setReportModal({
                      show: false,
                      selectedOptions: [],
                      additionalMessage: "",
                      questionId: null,
                    })
                  }
                  className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportQuestion}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#35095e] to-[#51216e] text-white hover:brightness-110 text-sm font-semibold shadow-lg"
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
            <div className="question-navigation mb-4 navborders overflow-x-auto m-auto w-full md:w-[90%] scroll-smooth">
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
                    onClick={() =>
                      setReportModal({
                        show: true,
                        selectedOptions: [],
                        additionalMessage: "",
                        questionId: filteredQuestions[currentQuestionIndex].id,
                      })
                    }
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

              <div className="option_btns grid md:grid-cols-2 gap-4">
                {renderOptionButtons(filteredQuestions[currentQuestionIndex])}
              </div>

              {userAnswers[filteredQuestions[currentQuestionIndex].id] && (
                 <div
    className={`mt-4 p-6 rounded-lg border ${
      userAnswers[filteredQuestions[currentQuestionIndex].id] ===
      filteredQuestions[currentQuestionIndex].correctOption
        ? "bg-green-100 border-green-300"
        : "bg-red-100 border-red-300"
    }`}
  >
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