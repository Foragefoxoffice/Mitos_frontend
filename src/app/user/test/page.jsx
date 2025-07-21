"use client";
import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  fetchFullTestQuestion,
  fetchFullTestByPortion,
  fetchCustomTestQuestions,
  checkFavoriteStatus,
  addFavoriteQuestion,
  removeFavoriteQuestion,
  reportWrongQuestion,
} from "@/utils/api";
import { TestContext } from "@/contexts/TestContext";
import { TestHeader } from "@/components/fulltest/TestHeader";
import { TestQuestion } from "@/components/fulltest/TestQuestion";
import { TestNavigation } from "@/components/fulltest/TestNavigation";
import { TestResults } from "@/components/fulltest/TestResults";
import { TestInstructions } from "@/components/fulltest/TestInstructions";
import { TestSidebar } from "@/components/fulltest/TestSidebar";
import { TestTimer } from "@/components/fulltest/TestTimer";
import Notification from "@/components/Notification";
import ImagePopup from "@/components/ImagePopup";
import { FaHeart, FaRegHeart, FaFlag } from "react-icons/fa";

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
  const [subjectFilter, setSubjectFilter] = useState(null);
  const router = useRouter();
  const { testData } = useContext(TestContext);
  const portionId = testData?.portionId;
  const chapterIds = testData?.chapterIds;
  const questionLimit = testData?.questionLimit;
  const [token, setToken] = useState(null);
  const questionNavRefs = useRef([]);
  const [userId, setUserId] = useState(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [imagePopup, setImagePopup] = useState({
    show: false,
    src: "",
  });
  const [favoriteQuestions, setFavoriteQuestions] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
      setUserId(localStorage.getItem("userId"));
    }
  }, []);

  const totalTime = useMemo(() => questions.length * 60, [questions.length]);

  const getUniqueSubjects = useMemo(() => {
    if (!questions || !Array.isArray(questions)) return [];
    
    const subjectsMap = new Map();

    questions.forEach((question) => {
      if (question?.subjectId) {
        const fullSubjectName =
          typeof question.subject === "string"
            ? question.subject
            : `Subject ${question.subjectId}`;

        const baseSubjectName = fullSubjectName.replace(
          /^\d+(th|rd|nd|st)\s/,
          ""
        );

        if (!subjectsMap.has(baseSubjectName)) {
          subjectsMap.set(baseSubjectName, {
            id: baseSubjectName,
            name: baseSubjectName,
            originalIds: new Set(),
          });
        }

        subjectsMap.get(baseSubjectName).originalIds.add(question.subjectId);
      }
    });

    return Array.from(subjectsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (!Array.isArray(questions)) return [];
    if (!subjectFilter) return questions;

    const subjectGroup = getUniqueSubjects.find(
      (subj) => subj.id === subjectFilter
    );

    if (!subjectGroup) return questions;

    return questions.filter((question) =>
      subjectGroup.originalIds.has(question?.subjectId)
    );
  }, [questions, subjectFilter, getUniqueSubjects]);

  useEffect(() => {
  if (filteredQuestions.length > 0) {
    setCurrentQuestionIndex(0);
    const firstQuestion = filteredQuestions[0];
    if (firstQuestion?.id) {
      setVisitedQuestions((prev) => ({
        ...prev,
        [firstQuestion.id]: true,
      }));
    }
  }
}, [filteredQuestions]);

  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }, []);

  const scrollToCurrentQuestion = useCallback(() => {
    if (questionNavRefs.current[currentQuestionIndex]) {
      questionNavRefs.current[currentQuestionIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    scrollToCurrentQuestion();
  }, [currentQuestionIndex, scrollToCurrentQuestion]);

  const handleAnswer = useCallback((questionId, answer) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
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
    if (!Array.isArray(filteredQuestions) || filteredQuestions.length === 0) return;

    // Regular next question navigation
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      const nextQuestion = filteredQuestions[currentQuestionIndex + 1];
      if (nextQuestion?.id) {
        setVisitedQuestions((prev) => ({ ...prev, [nextQuestion.id]: true }));
      }
      return;
    }

    // Subject change logic
    const currentSubjectIndex = getUniqueSubjects?.findIndex?.((subj) => subj.id === subjectFilter) ?? -1;

    if (currentSubjectIndex >= 0 && currentSubjectIndex < (getUniqueSubjects?.length ?? 0) - 1) {
      const nextSubject = getUniqueSubjects[currentSubjectIndex + 1];
      if (nextSubject) {
        setSubjectFilter(nextSubject.id);
        setCurrentQuestionIndex(0);

        const firstQuestionOfNewSubject = questions.find(
          (q) => nextSubject.originalIds.has(q?.subjectId)
        );
        
        if (firstQuestionOfNewSubject?.id) {
          setVisitedQuestions((prev) => ({
            ...prev,
            [firstQuestionOfNewSubject.id]: true,
          }));
        }
      }
    } else {
      // No more subjects, reset to first question
      setSubjectFilter(null);
      setCurrentQuestionIndex(0);
      
      if (questions[0]?.id) {
        setVisitedQuestions((prev) => ({
          ...prev,
          [questions[0].id]: true,
        }));
      }
    }
  }, [currentQuestionIndex, filteredQuestions, getUniqueSubjects, questions, subjectFilter]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      const prevQuestion = filteredQuestions[currentQuestionIndex - 1];
      if (prevQuestion?.id) {
        setVisitedQuestions((prev) => ({ ...prev, [prevQuestion.id]: true }));
      }
    }
  }, [currentQuestionIndex, filteredQuestions]);

  const handleQuestionNavigation = useCallback((index) => {
    if (Array.isArray(filteredQuestions) && index >= 0 && index < filteredQuestions.length) {
      setCurrentQuestionIndex(index);
      const question = filteredQuestions[index];
      if (question?.id) {
        setVisitedQuestions((prev) => ({ ...prev, [question.id]: true }));
      }
    }
  }, [filteredQuestions]);

  const calculateScore = useCallback(() => {
    let score = 0;

    if (!Array.isArray(questions)) return score;

    questions.forEach((question) => {
      const userAnswer = userAnswers[question.id];

      if (userAnswer !== undefined && userAnswer !== null && userAnswer !== "") {
        if (userAnswer === question.correctOption) {
          score += 4;
        } else {
          score -= 1;
        }
      }
    });

    return score;
  }, [questions, userAnswers]);

  const calculateCorrectAnswers = useCallback(() => {
    let correctCount = 0;
    if (!Array.isArray(questions)) return correctCount;
    
    questions.forEach((question) => {
      if (userAnswers[question.id] === question.correctOption) {
        correctCount++;
      }
    });
    return correctCount;
  }, [questions, userAnswers]);

  const calculateWrongAnswers = useCallback(() => {
    let wrongCount = 0;
    if (!Array.isArray(questions)) return wrongCount;
    
    questions.forEach((question) => {
      if (
        userAnswers[question.id] &&
        userAnswers[question.id] !== question.correctOption
      ) {
        wrongCount++;
      }
    });
    return wrongCount;
  }, [questions, userAnswers]);

  const calculateAccuracy = useCallback(() => {
    if (!Array.isArray(questions)) return 0;
    
    const correctAnswers = questions.filter(
      (question) => userAnswers[question.id] === question.correctOption
    ).length;
    const totalAnswered = Object.keys(userAnswers).length;
    return totalAnswered === 0
      ? 0
      : Math.round((correctAnswers / totalAnswered) * 100);
  }, [questions, userAnswers]);

  const calculateResultsByType = useCallback(() => {
    const resultsByType = {};
    if (!Array.isArray(questions)) return resultsByType;

    questions.forEach((question) => {
      if (!question) return;
      
      const typeName = question.type === "Unknown Type" ? "Uncategorized" : question.type;
      const typeId = question.typeId === "unknown" ? "uncategorized" : question.typeId;
      const subject = question.subject;
      const subjectId = question.subjectId;

      if (userAnswers[question.id] !== undefined) {
        if (!resultsByType[typeId]) {
          resultsByType[typeId] = {
            typeName,
            typeId,
            attempted: 0,
            correct: 0,
            wrong: 0,
            subjects: {},
          };
        }

        if (!resultsByType[typeId].subjects[subject]) {
          resultsByType[typeId].subjects[subject] = {
            subjectId,
            attempted: 0,
            correct: 0,
            wrong: 0,
          };
        }

        resultsByType[typeId].attempted += 1;
        resultsByType[typeId].subjects[subject].attempted += 1;

        if (userAnswers[question.id] === question.correctOption) {
          resultsByType[typeId].correct += 1;
          resultsByType[typeId].subjects[subject].correct += 1;
        } else {
          resultsByType[typeId].wrong += 1;
          resultsByType[typeId].subjects[subject].wrong += 1;
        }
      }
    });

    return resultsByType;
  }, [questions, userAnswers]);

  const calculateResultsByChapter = useCallback(() => {
    const resultsByChapter = {};
    if (!Array.isArray(questions)) return resultsByChapter;

    questions.forEach((question) => {
      if (!question) return;
      
      const chapterId = question.chapterId;
      const chapterName = question.chapter;
      const subject = question.subject;
      const subjectId = question.subjectId;

      if (userAnswers[question.id] !== undefined) {
        if (!resultsByChapter[chapterId]) {
          resultsByChapter[chapterId] = {
            chapterName,
            attempted: 0,
            correct: 0,
            wrong: 0,
            subjectId,
            subject,
          };
        }

        resultsByChapter[chapterId].attempted += 1;

        if (userAnswers[question.id] === question.correctOption) {
          resultsByChapter[chapterId].correct += 1;
        } else {
          resultsByChapter[chapterId].wrong += 1;
        }
      }
    });

    return resultsByChapter;
  }, [questions, userAnswers]);

  const calculateResultsBySubject = useCallback(() => {
    const resultsBySubject = {};
    if (!Array.isArray(questions)) return resultsBySubject;

    questions.forEach((question) => {
      if (!question) return;
      
      const subjectId = question.subjectId;
      const subjectName = question.subject;

      if (!resultsBySubject[subjectId]) {
        resultsBySubject[subjectId] = {
          subjectName,
          attempted: 0,
          correct: 0,
          wrong: 0,
          unanswered: 0,
          accuracy: 0,
          total: 0,
        };
      }

      resultsBySubject[subjectId].total += 1;

      if (userAnswers[question.id] !== undefined) {
        resultsBySubject[subjectId].attempted += 1;

        if (userAnswers[question.id] === question.correctOption) {
          resultsBySubject[subjectId].correct += 1;
        } else {
          resultsBySubject[subjectId].wrong += 1;
        }
      } else {
        resultsBySubject[subjectId].unanswered += 1;
      }
    });

    Object.keys(resultsBySubject).forEach((subjectId) => {
      const subject = resultsBySubject[subjectId];
      subject.accuracy =
        subject.attempted === 0
          ? 0
          : Math.round((subject.correct / subject.attempted) * 100);
    });

    return resultsBySubject;
  }, [questions, userAnswers]);

  const saveTestResult = useCallback(
    async (resultData) => {
      try {
        const response = await fetch("https://mitoslearning.in/api/tests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(resultData),
        });

        if (!response.ok) {
          throw new Error("Failed to save test result");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error saving test result:", error);
        throw error;
      }
    },
    [token]
  );

  const checkFavorites = useCallback(async () => {
    if (Array.isArray(questions) && questions.length > 0 && token && userId) {
      try {
        const response = await checkFavoriteStatus(userId, token);
        const favoriteStatus = {};

        questions.forEach((question) => {
          if (question?.id) {
            favoriteStatus[question.id] = false;
          }
        });

        response.data?.forEach?.((favQuestion) => {
          if (favQuestion?.questionId) {
            favoriteStatus[favQuestion.questionId] = true;
          }
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

        setTimeout(() => {
          setNotification({ show: false, message: "", type: "" });
        }, 3000);

        return;
      }

      const finalReason = `${selectedOptions.join(", ")}${
        additionalMessage ? ` | Details: ${additionalMessage}` : ""
      }`;

      await reportWrongQuestion(questionId, finalReason);

      setNotification({
        show: true,
        message: "Question reported successfully. Thank you!",
        type: "success",
      });

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);

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

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    }
  };

  const handleSubmit = useCallback(async () => {
    setShowSubmitConfirmation(false);

    if (!userId) {
      setError("User ID not found. Please log in again.");
      return;
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      setError("No questions available to submit.");
      return;
    }

    try {
      const resultsBySubject = calculateResultsBySubject();

      const resultData = {
        userId: parseInt(userId, 10),
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
        resultsBySubject,
      };

      await saveTestResult(resultData);
      setShowResults(true);
    } catch (error) {
      console.error("Failed to save test result:", error);
      setError("Failed to save test result. Please try again.");
    }
  }, [
    userId,
    questions,
    userAnswers,
    calculateScore,
    calculateCorrectAnswers,
    calculateWrongAnswers,
    calculateAccuracy,
    calculateResultsByType,
    calculateResultsByChapter,
    calculateResultsBySubject,
    formatTime,
    totalTime,
    timeLeft,
    saveTestResult,
  ]);

  const showSubmitConfirmationPopup = useCallback(() => {
    setShowSubmitConfirmation(true);
  }, []);

  useEffect(() => {
    let timer;

    if (!showInstructionPopup && !showResults && Array.isArray(questions) && questions.length > 0) {
      if (timeLeft === 0) {
        setTimeLeft(totalTime);
      }

      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    showInstructionPopup,
    showResults,
    questions,
    totalTime,
    handleSubmit,
  ]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        if (!testData) {
          setError("Test data is not available. Please go back and try again.");
          setLoading(false);
          router.push("/user/dashboard");
          return;
        }

        let testQuestions = [];

        switch (testData.testname) {
          case "full-portion":
            testQuestions = (await fetchFullTestQuestion())?.data || [];
            break;

          case "portion-full-test":
            if (!portionId) {
              setError("Portion ID is missing. Please go back and try again.");
              setLoading(false);
              router.push("/dashboard");
              return;
            }
            testQuestions =
              (await fetchFullTestByPortion(portionId))?.data || [];
            break;

          case "custom-test":
            if (!portionId || !chapterIds?.length) {
              setError(
                "Portion ID or Chapter IDs are missing. Please go back and try again."
              );
              setLoading(false);
              router.push("/dashboard");
              return;
            }

            const customQuestions = await fetchCustomTestQuestions(
              portionId,
              chapterIds,
              questionLimit
            );
            testQuestions = customQuestions || [];
            break;

          default:
            setError("Invalid test type. Please go back and try again.");
            setLoading(false);
            router.push("/dashboard");
            return;
        }

        const deduplicatedQuestions = testQuestions.filter(
          (question, index, self) =>
            index === self.findIndex((q) => q.id === question.id)
        );

  const formattedQuestions = deduplicatedQuestions.map((question) => {
  const typeName =
    question.questionType?.name?.trim() ||
    question.type?.name?.trim() ||
    (typeof question.questionType === "string" ? question.questionType.trim() : "") ||
    (typeof question.type === "string" ? question.type.trim() : "") ||
    "General";

  const chapterName =
    question.chapter?.name?.trim() ||
    (typeof question.chapter === "string" ? question.chapter.trim() : "") ||
    (question.chapterId ? `Chapter ${question.chapterId}` : "General Chapter");

  return {
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
    typeId: question.questionTypeId || question.typeId || "general",
    type: typeName,
    subject:
      question.subject?.name ||
      (question.subjectId ? `Subject ${question.subjectId}` : "General Subject"),
    subjectId: question.subjectId,
    chapter: chapterName,
    chapterId: question.chapterId,
  };
});


        setQuestions(formattedQuestions);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError("Unable to load questions. Please try again later.");
        router.push("/user/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [testData, portionId, chapterIds, router]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        router.push("/user/dashboard");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, router]);

  if (loading) {
    return <div className="container py-6">Loading questions...</div>;
  }

  if (error) {
    return (
      <div className="container py-6 text-red-500">
        {error}
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  const currentQuestion = Array.isArray(filteredQuestions) && filteredQuestions[currentQuestionIndex] 
    ? filteredQuestions[currentQuestionIndex] 
    : null;

  return (
    <div className="container py-6">
      {showSubmitConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl text-[#35095E] font-bold mb-4">
              Confirm Submission
            </h3>
            <p className="mb-6">
              Are you sure you want to submit the test? You won't be able to
              make changes after submission.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowSubmitConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}

      {reportModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl rounded-2xl shadow-2xl p-6 bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 animate-fade-in">
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

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              What seems to be the problem with this question? You can select multiple options.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {REPORT_OPTIONS.map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium cursor-pointer transition duration-150 hover:shadow-md ${
                    reportModal.selectedOptions?.includes(option)
                      ? "bg-purple-100 border-purple-500 dark:bg-purple-800/30"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={reportModal.selectedOptions?.includes(option)}
                    onChange={(e) => {
                      const updatedOptions = e.target.checked
                        ? [...(reportModal.selectedOptions || []), option]
                        : (reportModal.selectedOptions || []).filter((o) => o !== option);

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

      {showResults && showAnswer === false && (
        <TestResults
          calculateScore={calculateScore}
          totalTime={totalTime}
          totalMarks={questions.length * 4}
          timeLeft={timeLeft}
          formatTime={formatTime}
          userAnswers={userAnswers}
          questions={questions}
          calculateCorrectAnswers={calculateCorrectAnswers}
          calculateWrongAnswers={calculateWrongAnswers}
          calculateAccuracy={calculateAccuracy}
          resultsBySubject={calculateResultsBySubject()}
          resultsByType={calculateResultsByType()}
          onShowAnswers={(value) => {
            setShowAnswer(value);
          }}
        />
      )}

      {showInstructionPopup && (
        <TestInstructions setShowInstructionPopup={setShowInstructionPopup} />
      )}

      <TestHeader />

      {Array.isArray(questions) && questions.length > 0 && !showInstructionPopup && (
        <div className="test_containers">
          <div className="test_container1">
            <TestTimer
              timeLeft={timeLeft}
              totalTime={totalTime}
              formatTime={formatTime}
              getUniqueSubjects={getUniqueSubjects}
              subjectFilter={subjectFilter}
              setSubjectFilter={setSubjectFilter}
              showSubmitConfirmationPopup={showSubmitConfirmationPopup}
              showAnswer={showAnswer}
              onShowAnswers={(value) => {
                setShowAnswer(value);
              }}
              onReportQuestion={() => {
                setReportModal({
                  show: true,
                  selectedOptions: [],
                  additionalMessage: "",
                  questionId: currentQuestion?.id || null,
                });
              }}
            />

            {currentQuestion && (
              <TestQuestion
                question={currentQuestion}
                userAnswers={userAnswers}
                handleAnswer={handleAnswer}
                currentQuestionIndex={currentQuestionIndex}
                filteredQuestions={filteredQuestions}
                isFavorite={favoriteQuestions[currentQuestion.id]}
                toggleFavorite={toggleFavorite}
                onShowAnswers={showAnswer}
                onReportQuestion={() => {
                  setReportModal({
                    show: true,
                    selectedOptions: [],
                    additionalMessage: "",
                    questionId: currentQuestion.id,
                  });
                }}
              />
            )}

            <TestNavigation
              currentQuestionIndex={currentQuestionIndex}
              filteredQuestions={filteredQuestions}
              handlePrevious={handlePrevious}
              handleNext={handleNext}
              toggleMarkAsReview={toggleMarkAsReview}
              markedQuestions={markedQuestions}
              question={currentQuestion}
              getUniqueSubjects={getUniqueSubjects}
              subjectFilter={subjectFilter}
              onShowAnswers={showAnswer}
            />
          </div>
          <div className="test_container2">
            <TestSidebar
              filteredQuestions={filteredQuestions}
              userAnswers={userAnswers}
              visitedQuestions={visitedQuestions}
              markedQuestions={markedQuestions}
              handleQuestionNavigation={handleQuestionNavigation}
              questionNavRefs={questionNavRefs}
              onShowAnswers={showAnswer}
            />
          </div>
        </div>
      )}

      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
}