"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  fetchQuestions, 
  fetchQuestionsByTypes,
  checkFavoriteStatus,
  addFavoriteQuestion,
  removeFavoriteQuestion
} from "@/utils/api";
import { useSelectedTopics } from "@/contexts/SelectedTopicsContext";
import { useSelectedQuestionTypes } from "@/contexts/SelectedQuestionTypesContext";
import PracticeNavbar from "@/components/user/practicenavbar";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import DOMPurify from "dompurify";

const HtmlWithMath = ({ html }) => {
  // Sanitize the HTML first
  const cleanHtml = DOMPurify.sanitize(html);
  
  return (
    <MathJax inline dynamic>
      <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </MathJax>
  );
};

export default function TestPage() {
  const { selectedTopics } = useSelectedTopics();
  const { selectedQuestionTypes, chapterId } = useSelectedQuestionTypes();
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
  const router = useRouter();
  const ChapterId = chapterId;

  // Get token and userId from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        setHasCheckedQuestions(false);
        
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
  
          // Merge and deduplicate questions
          const allQuestions = [...questionsByTopics, ...questionsByTypes].filter(
            (question, index, self) => index === self.findIndex((q) => q.id === question.id)
          );
  
          if (allQuestions.length === 0) {
            setError("No questions found for the selected criteria.");
          }
  
          const formattedQuestions = allQuestions.map((question) => ({
            id: question.id,
            question: question.question,
            options: [question.optionA, question.optionB, question.optionC, question.optionD],
            correctOption: question.correctOption,
            hint: question.hint,
            image: question.image,
            hintImage: question.hintImage,
          }));
  
          setQuestions(formattedQuestions);

          // Initialize favorite status for each question
          const favorites = {};
          formattedQuestions.forEach(question => {
            favorites[question.id] = false;
          });
          setFavoriteQuestions(favorites);
        } else {
          setError("No topics or question types selected.");
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError("Unable to load questions. Please try again later.");
      } finally {
        setLoading(false);
        setHasCheckedQuestions(true);
      }
    };
  
    loadQuestions();
  }, [selectedTopics, selectedQuestionTypes, ChapterId]);

  const checkFavorites = useCallback(async () => {
    if (questions.length > 0 && token && userId) {
      try {
        const response = await checkFavoriteStatus(userId, token);
        const favoriteStatus = {};
        
        questions.forEach(question => {
          favoriteStatus[question.id] = false;
        });
        
        response.data.forEach(favQuestion => {
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

  const toggleFavorite = useCallback(async (questionId) => {
    try {
      const isCurrentlyFavorite = favoriteQuestions[questionId];
      
      if (isCurrentlyFavorite) {
        await removeFavoriteQuestion(userId, questionId, token);
      } else {
        await addFavoriteQuestion(userId, questionId, token);
      }
      
      // Update local state
      setFavoriteQuestions(prev => ({
        ...prev,
        [questionId]: !isCurrentlyFavorite
      }));
      
      return true;
    } catch (error) {
      console.error("Error updating favorite status:", error);
      return false;
    }
  }, [token, userId, favoriteQuestions]);

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
      const limit = questionLimit === "full" ? questions.length : Math.min(parseInt(questionLimit), questions.length);
      setFilteredQuestions(questions.slice(0, limit));
      setCurrentQuestionIndex(0);
    }
  }, [questionLimit, questions]);

  const generateQuestionLimits = (totalQuestions) => {
  if (totalQuestions === 0) return [];
  
  const limits = new Set([180]); // Start with 180 as default
  const step = totalQuestions <= 40 ? 10 : totalQuestions <= 50 ? 15 : 20;

  for (let i = step; i < Math.min(totalQuestions, 180); i += step) {
    limits.add(i);
  }

  if (totalQuestions > 180) {
    limits.add("full");
  }
  
  return Array.from(limits).sort((a, b) => {
    if (a === "full") return 1;
    if (b === "full") return -1;
    return a - b;
  });
};
  const handleAnswer = (questionId, answer) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    setVisitedQuestions(prev => ({ ...prev, [questionId]: true }));

    if (currentQuestionIndex === filteredQuestions.length - 1) {
      setLastQuestionAttempted(true);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      const nextQuestionId = filteredQuestions[currentQuestionIndex + 1].id;
      setVisitedQuestions(prev => ({ ...prev, [nextQuestionId]: true }));
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      const prevQuestionId = filteredQuestions[currentQuestionIndex - 1].id;
      setVisitedQuestions(prev => ({ ...prev, [prevQuestionId]: true }));
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
    setVisitedQuestions(prev => ({ ...prev, [questionId]: true }));
  };

  const questionLimits = generateQuestionLimits(questions.length);

  const renderOptionButtons = (question) => {
    if (!question) return null;
    
    return question.options.map((option, index) => {
      const isSelected = userAnswers[question.id] === option;
      const optionLabels = ["A", "B", "C", "D"];
      const currentOptionLabel = optionLabels[index];
      const isCorrect = question.correctOption === currentOptionLabel;
      const isWrong = isSelected && !isCorrect;
      const isCorrectOption = question.correctOption === currentOptionLabel;

      let buttonClass = "flex items-center gap-2 w-full text-left p-2 rounded-lg border ";

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
          onClick={() => handleAnswer(question.id, option)}
          className={buttonClass}
        >
          <span className="font-bold option_label">{currentOptionLabel}</span>
          <HtmlWithMath html={option} />
        </button>
      );
    });
  };

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
      <div className="container pt-6">
        {showNoQuestionsPopup && questions.length === 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
            <div className="question_popup">
              <h2>No Questions Available</h2>
              <p className="text-center">You will be redirected to the dashboard shortly.</p>
            </div>
          </div>
        )}

        
{showQuantityPopup && questions.length > 0 && !showNoQuestionsPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
    <div className="question_popup">
      <h2>Select Number Of Questions</h2>
      <label className="flex items-center gap-2 p-2">
        <input
          type="radio"
          name="questionLimit"
          value={180}
          onChange={() => handleLimitSelection(180)}
          className="form-radio"
          defaultChecked // This will make 180 selected by default
        />
        <span className="text-gray-800">180 Questions (Default)</span>
      </label>
      {questionLimits.map((limit, index) => (
        limit !== 180 && ( // Don't show 180 again if it's already in questionLimits
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
                ? `Full Test (${questions.length} Questions)`
                : `${limit} Questions`}
            </span>
          </label>
        )
      ))}
    </div>
  </div>
)}
        <div className="test_nav">
          <PracticeNavbar />
        </div>

        {filteredQuestions.length > 0 && (
          <div className="test_containerss">
            <div className="test_container1">
              <div className="flex justify-between items-center">
                <h2 className="">
                  Question {currentQuestionIndex + 1} / {filteredQuestions.length}
                </h2>
                <button
                  onClick={() => toggleFavorite(filteredQuestions[currentQuestionIndex].id)}
                  className="p-2 rounded-full bg-transparent transition duration-200"
                  aria-label={favoriteQuestions[filteredQuestions[currentQuestionIndex].id] ? "Remove from favorites" : "Add to favorites"}
                >
                  {favoriteQuestions[filteredQuestions[currentQuestionIndex].id] ? (
                    <FaHeart className="text-red-500 w-6 h-6" />
                  ) : (
                    <FaRegHeart className="text-black w-6 h-6" />
                  )}
                </button>
              </div>
              
              <div className="question-content">
                <HtmlWithMath html={filteredQuestions[currentQuestionIndex].question} />
              </div>
              
              {filteredQuestions[currentQuestionIndex].image && (
                <img 
                  src={`https://mitoslearning.in/${filteredQuestions[currentQuestionIndex].image}`} 
                  alt="Question illustration"
                  className="max-w-full h-auto my-4"
                /> 
              )}
              
              <div className="option_btns space-y-2">
                {renderOptionButtons(filteredQuestions[currentQuestionIndex])}
              </div>

              {userAnswers[filteredQuestions[currentQuestionIndex].id] &&
                userAnswers[filteredQuestions[currentQuestionIndex].id] !==
                filteredQuestions[currentQuestionIndex].correctOption && (
                  <div className="mt-4">
                    <p className="text-green-500 font-semibold">
                      Correct Answer: {filteredQuestions[currentQuestionIndex].correctOption}
                    </p>
                    {filteredQuestions[currentQuestionIndex].hint && (
                      <div className="mt-2">
                        <p className="text-red-500 font-semibold">Hint:</p>
                        {filteredQuestions[currentQuestionIndex].hintImage && (
                          <img 
                            src={`https://mitoslearning.in/${filteredQuestions[currentQuestionIndex].hintImage}`} 
                            alt="Hint illustration"
                            className="max-w-full h-auto my-2"
                          /> 
                        )}
                        <HtmlWithMath html={filteredQuestions[currentQuestionIndex].hint} />
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
                    Submit
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
    </MathJaxContext>
  );
}