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
} from "@/utils/api";
import { TestContext } from "@/contexts/TestContext";
import { TestHeader } from "@/components/fulltest/TestHeader";
import { TestQuestion } from "@/components/fulltest/TestQuestion";
import { TestNavigation } from "@/components/fulltest/TestNavigation";
import { TestResults } from "@/components/fulltest/TestResults";
import { TestInstructions } from "@/components/fulltest/TestInstructions";
import { TestSidebar } from "@/components/fulltest/TestSidebar";
import { TestTimer } from "@/components/fulltest/TestTimer";

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
  const questionCount = testData?.questionCount;
  const [token, setToken] = useState(null);
  const questionNavRefs = useRef([]);
  const [userId, setUserId] = useState(null);

  const [favoriteQuestions, setFavoriteQuestions] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
      setUserId(localStorage.getItem("userId"));
    }
  }, []);

  const totalTime = useMemo(() => questions.length * 60, [questions.length]);

  const getUniqueSubjects = useMemo(() => {
    const subjectsMap = new Map();

    questions.forEach((question) => {
      if (question.subjectId) {
        const name = typeof question.subject === "string"
          ? question.subject
          : `Subject ${question.subjectId}`;

        subjectsMap.set(question.subjectId, {
          id: question.subjectId,
          name: name,
        });
      }
    });

    return Array.from(subjectsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (!subjectFilter) return questions;
    return questions.filter((question) => question.subjectId === subjectFilter);
  }, [questions, subjectFilter]);

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
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      const nextQuestionId = filteredQuestions[currentQuestionIndex + 1].id;
      setVisitedQuestions((prev) => ({ ...prev, [nextQuestionId]: true }));
    }
  }, [currentQuestionIndex, filteredQuestions]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      const prevQuestionId = filteredQuestions[currentQuestionIndex - 1].id;
      setVisitedQuestions((prev) => ({ ...prev, [prevQuestionId]: true }));
    }
  }, [currentQuestionIndex, filteredQuestions]);

  const handleQuestionNavigation = useCallback(
    (index) => {
      setCurrentQuestionIndex(index);
      const questionId = filteredQuestions[index].id;
      setVisitedQuestions((prev) => ({ ...prev, [questionId]: true }));
    },
    [filteredQuestions]
  );

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

  questions.forEach((question) => {
    const typeId = question.typeId;
    const typeName = question.type; // This should now have the correct name
    const subject = question.subject;

    if (userAnswers[question.id] !== undefined) {
      if (!resultsByType[typeId]) {
        resultsByType[typeId] = {
          typeName,
          attempted: 0,
          correct: 0,
          wrong: 0,
          subjects: {},
        };
      }

      if (!resultsByType[typeId].subjects[subject]) {
        resultsByType[typeId].subjects[subject] = {
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

    questions.forEach((question) => {
      const chapterId = question.chapterId;
      const chapterName = question.chapter;
      const subject = question.subject;

      if (userAnswers[question.id] !== undefined) {
        if (!resultsByChapter[chapterId]) {
          resultsByChapter[chapterId] = {
            chapterName,
            attempted: 0,
            correct: 0,
            wrong: 0,
            subject: subject,
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

    questions.forEach((question) => {
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

  const toggleFavoriteQuestion = useCallback(async (questionId) => {
    try {
      const isCurrentlyFavorite = favoriteQuestions[questionId];
      
      if (isCurrentlyFavorite) {
        // DELETE request
        const response = await fetch("https://mitoslearning.in/api/fav-questions", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: parseInt(userId, 10),
            questionId: questionId
          }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to remove favorite");
        }
      } else {
        // POST request
        const response = await fetch("https://mitoslearning.in/api/fav-questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: parseInt(userId, 10),
            questionId: questionId
          }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to add favorite");
        }
      }
  
      return true;
    } catch (error) {
      console.error("Error updating favorite status:", error);
      throw error;
    }
  }, [token, userId, favoriteQuestions]);
  
  // Add this toggle function
  const toggleFavorite = useCallback(async (questionId) => {
    try {
      await toggleFavoriteQuestion(questionId);
      setFavoriteQuestions(prev => ({
        ...prev,
        [questionId]: !prev[questionId]
      }));
    } catch (error) {
      console.error("Failed to update favorite status:", error);
      setError("Failed to update favorite status. Please try again.");
    }
  }, [toggleFavoriteQuestion]);

  const handleSubmit = useCallback(async () => {
    if (!userId) {
      setError("User ID not found. Please log in again.");

      return;
    }
  
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
  
    try {
      await saveTestResult(resultData);
      setShowResults(true);
    } catch (error) {
      console.error("Failed to save test result:", error);
      setError("Failed to save test result. Please try again.");
      router.push('/user/dashboard');
    }
  }, [
    userId,
    calculateScore,
    calculateCorrectAnswers,
    calculateWrongAnswers,
    calculateAccuracy,
    calculateResultsByType,
    calculateResultsByChapter,
    calculateResultsBySubject,
    questions.length,
    userAnswers,
    totalTime,
    timeLeft,
    formatTime,
    saveTestResult,
    router
  ]);

  useEffect(() => {
    let timer;
    
    if (!showInstructionPopup && !showResults && questions.length > 0) {
      // Initialize timeLeft if not set
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
  }, [showInstructionPopup, showResults, questions.length, totalTime, handleSubmit]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        if (!testData) {
          setError("Test data is not available. Please go back and try again.");
          setLoading(false);
          router.push('/user/dashboard');
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
              router.push('/dashboard');
              return;
            }
            testQuestions = (await fetchFullTestByPortion(portionId))?.data || [];
            break;

          case "custom-test":
            if (!portionId || !chapterIds?.length) {
              setError("Portion ID or Chapter IDs are missing. Please go back and try again.");
              setLoading(false);
              router.push('/dashboard');
              return;
            }

            const customQuestions = await fetchCustomTestQuestions(
              portionId,
              chapterIds
            );
            testQuestions = customQuestions || [];
            break;

          default:
            setError("Invalid test type. Please go back and try again.");
            setLoading(false);
            router.push('/dashboard');
            return;
        }

        const deduplicatedQuestions = testQuestions.filter(
          (question, index, self) =>
            index === self.findIndex((q) => q.id === question.id)
        );

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
  typeId: question.questionTypeId || question.typeId || "Unknown",
  type: question.questionType?.name || 
       question.type?.name ||
       question.questionType ||
       question.type ||
       "Unknown",
  subject: question.subject?.name || 
          (question.subjectId ? `Subject ${question.subjectId}` : "Unknown"),
  subjectId: question.subjectId,
  chapter: question.chapter?.name || 
          (question.chapter ? String(question.chapter) :
          (question.chapterId ? `Chapter ${question.chapterId}` : "Unknown")),
  chapterId: question.chapterId,
}));

        setQuestions(formattedQuestions);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError("Unable to load questions. Please try again later.");
        router.push('/user/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [testData, portionId, chapterIds, router]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        router.push('/user/dashboard');
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

  return (
    <div className="container py-6">
      {showResults && (
        <TestResults
          calculateScore={calculateScore}
          totalTime={totalTime}
          timeLeft={timeLeft}
          formatTime={formatTime}
          userAnswers={userAnswers}
          questions={questions}
          calculateCorrectAnswers={calculateCorrectAnswers}
          calculateWrongAnswers={calculateWrongAnswers}
          calculateAccuracy={calculateAccuracy}
          resultsBySubject={calculateResultsBySubject()} 
          resultsByType={calculateResultsByType()}
        />
      )}

      {showInstructionPopup && (
        <TestInstructions setShowInstructionPopup={setShowInstructionPopup} />
      )}

      <TestHeader />

      {questions.length > 0 && !showInstructionPopup && !showResults && (
        <div className="test_containers">
          <div className="test_container1">
            <TestTimer
              timeLeft={timeLeft}
              formatTime={formatTime}
              getUniqueSubjects={getUniqueSubjects}
              subjectFilter={subjectFilter}
              setSubjectFilter={setSubjectFilter}
              handleSubmit={handleSubmit}
            />

            <TestQuestion
              question={filteredQuestions[currentQuestionIndex]}
              userAnswers={userAnswers}
              handleAnswer={handleAnswer}
              currentQuestionIndex={currentQuestionIndex}
              filteredQuestions={filteredQuestions}
              isFavorite={favoriteQuestions[filteredQuestions[currentQuestionIndex].id]}
              toggleFavorite={toggleFavorite}
            />

            <TestNavigation
              currentQuestionIndex={currentQuestionIndex}
              filteredQuestions={filteredQuestions}
              handlePrevious={handlePrevious}
              handleNext={handleNext}
              toggleMarkAsReview={toggleMarkAsReview}
              markedQuestions={markedQuestions}
              question={filteredQuestions[currentQuestionIndex]}
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
            />
          </div>
        </div>
      )}
    </div>
  );
}