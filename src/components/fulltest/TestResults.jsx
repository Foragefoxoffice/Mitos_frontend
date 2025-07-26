"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export const TestResults = ({
  calculateScore,
  totalMarks,
  totalTime,
  timeLeft,
  formatTime,
  userAnswers,
  questions,
  calculateCorrectAnswers,
  calculateWrongAnswers,
  calculateAccuracy,
  resultsBySubject,
  resultsByType,
    onShowAnswers,
}) => {
  const router = useRouter();
  const [showTypeResults, setShowTypeResults] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
      <div className="bg-white  md:grid md:place-content-center md:gap-10 p-5 md:p-9 rounded-lg shadow-lg w-[90%] md:w-[50%] max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl text-center font-bold text-[#35095E]">
          Your Score
        </h2>
        <div className="above_score">
          <div className="ascore_content shadow-md">
            <p>Your score:</p> <span>{calculateScore()}/{totalMarks}</span>
          </div>
          <div className="ascore_content shadow-md">
            <p>Total Time Taken: </p>
            <div className="flex justify-center items-center gap-3">
              <img
                className="w-8 h-9"
                src="/images/menuicon/time.png"
                alt="time icon"
              />
              <span className="">{formatTime(totalTime - timeLeft)} MM</span>
            </div>
          </div>
        </div>

        {/* Subject-wise performance section without table */}
        <div className="subject-performance">
          <div className="flex justify-center flex-wrap gap-3">
          {Object.values(
  Object.entries(resultsBySubject).reduce((acc, [_, subjectData]) => {
    const pureName = subjectData.subjectName.replace(/^\d+\w*\s/, '').trim();

    if (!acc[pureName]) {
      acc[pureName] = {
        subjectName: pureName,
        correct: 0,
        wrong: 0,
      };
    }

    acc[pureName].correct += subjectData.correct;
    acc[pureName].wrong += subjectData.wrong;

    return acc;
  }, {})
).map((subjectData) => {
  const marks = subjectData.correct * 4 - subjectData.wrong;
  return (
    <div key={subjectData.subjectName} className="p-4 px-6 bg-white rounded-lg shadow-md">
      <span className="text-lg">{subjectData.subjectName}</span>
      <span className={` block text-center font-bold ${marks < 0 ? "text-red-500" : "text-[#35095e]"}`}>
        {marks}
      </span>
    </div>
  );
})}

          </div>
        </div>

        <div className="below_scroe">
          <div className="bscore_content bg-[#498FE0]">
            <p>Answered</p>
            <span>{Object.keys(userAnswers).length}</span>
          </div>
          <div className="bscore_content bg-[#9BCD13]">
            <p>Correct</p>
            <span>{calculateCorrectAnswers()}</span>
          </div>
          <div className="bscore_content bg-[#3157D4]">
            <p>Unanswered</p>
            <span>{questions.length - Object.keys(userAnswers).length}</span>
          </div>
          <div className="bscore_content bg-[#FF0000]">
            <p>Wrong</p>
            <span>{calculateWrongAnswers()}</span>
          </div>
          <div className="bscore_content bg-[#D43190]">
            <p>Accuracy</p>
            <span>{calculateAccuracy()}%</span>
          </div>
        </div>
<div className="md:flex justify-center gap-5">
<button
          onClick={() => setShowTypeResults(true)}
          className="test_btn w-[100%] "
        >
          View Question Type Analysis
        </button>
<button
  onClick={() => {
    setShowAnswer(true);
    onShowAnswers?.(true); // Call parent function if defined
  }}
  className="test_btn w-[100%]"
>
  View Answers
</button>


        <button
          onClick={() => router.push("/user/dashboard")}
          className="test_btn w-[100%]"
        >
          Go back to another test
        </button>
</div>
        
      </div>

      {/* Question Type Results Modal */}
      {showTypeResults && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="bg-white p-5 md:p-8 rounded-lg shadow-lg w-[90%]  md:w-[70%] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#35095E]">
                Question Type Analysis
              </h2>
              <button
                onClick={() => setShowTypeResults(false)}
                className="text-[#35095e] bg-white hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(resultsByType).map(([typeId, typeData]) => (
                <div key={typeId} className="bg-gray-50 p-4 rounded-lg">
                  <div className="md:flex justify-between items-center mb-3">
                    <h3 className="text-lg mb-3 font-semibold text-[#35095E]">
                      {typeData.typeName}
                    </h3>
                    <div className="flex gap-4">
                      <span className="text-blue-600 text-lg">
                        Attempted: {typeData.attempted}
                      </span>
                      <span className="text-green-600 text-lg">
                        Correct: {typeData.correct}
                      </span>
                      <span className="text-red-600 text-lg">
                        Wrong: {typeData.wrong}
                      </span>
                      
                    </div>
                  </div>

                  <div className="md:ml-4 space-y-3">
                    {/* <h4 className="font-medium text-gray-700">By Subject:</h4> */}
                    {Object.entries(typeData.subjects).map(
                      ([subjectId, subjectData]) => (
                        <div
                          key={subjectId}
                          className="flex justify-between items-center bg-white p-2 rounded shadow-sm"
                        >
                          <span className="text-lg">{subjectId}</span>
                          <div className="flex gap-4">
                            <span className="text-blue-600 text-lg">
                              ↻ {subjectData.attempted}
                            </span>
                            <span className="text-green-600 text-lg">
                              ✓ {subjectData.correct}
                            </span>
                            <span className="text-red-600 text-lg">
                              ✗ {subjectData.wrong}
                            </span>
                            
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowTypeResults(false)}
                className="test_btn m-0 bg-[#35095E] hover:bg-[#4a0d7e]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};