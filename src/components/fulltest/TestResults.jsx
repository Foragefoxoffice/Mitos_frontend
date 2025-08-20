"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export const TestResults = ({
  calculateScore,
  totalMarks,
  totalTime,
  timeLeft,
  formatTime,
  userAnswers = {},
  questions = [],
  calculateCorrectAnswers,
  calculateWrongAnswers,
  calculateAccuracy,
  resultsBySubject = {},
  resultsByType = {},
  onShowAnswers,
}) => {
  const router = useRouter();
  const [showTypeResults, setShowTypeResults] = useState(false);

  // ✅ compute attempted safely here
  const attempted = Object.keys(userAnswers || {}).length;

  const subjects = ["Physics", "Chemistry", "Biology"];
  const subjectColors = {
    Physics: "bg-[#B57170]",
    Chemistry: "bg-[#E1AD01]",
    Biology: "bg-[#32CD32]",
  };

  const processedSubjects = subjects.map((subj) => {
    const match = Object.values(resultsBySubject || {}).find((r) =>
      (r.subjectName || "").toLowerCase().includes(subj.toLowerCase())
    );
    const marks = match ? match.correct * 4 - match.wrong : 0;
    return { name: subj, marks };
  });

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 h-[auto] md:h-[auto] overflow-auto flex items-center justify-center">
      <div className="relative bg-[#F0F8FF] rounded-2xl shadow-2xl w-[95%] max-w-[800px] p-6 pt-10 text-center">
        {/* Trophy */}
        <div className="absolute -top-[244px] left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <img
              src="/images/practice/done.png"
              alt="Trophy"
              className="w-[100%] h-[400px] object-contain mx-auto"
            />
          </div>
        </div>

        <h2 className="text-4xl font-bold text-[#000] mb-6 mt-7">Your Score</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm md:px-20 px-4">
          <div className="border border-[#D3CBFB] flex flex-col gap-2 rounded-3xl py-4 px-2 bg-white shadow-inner justify-center">
            <p className="text-black text-2xl font-semibold">
              Over All Score :
            </p>
            <p className="text-[#007ACC] md:text-4xl text-2xl font-semibold">
              {calculateScore()} / {totalMarks}
            </p>
          </div>
          <div className="border border-[#e0e0e0] rounded-3xl py-6 px-4 bg-white flex flex-col gap-2 shadow-inner">
            <p className="text-black text-2xl font-semibold">
              Total Time Taken:
            </p>
            <div className="flex justify-center items-center gap-1 text-red-600 font-bold text-2xl">
              <img src="/images/menuicon/time.png" className="w-8 h-auto" />
              {formatTime(totalTime - timeLeft)} MIN
            </div>
          </div>
        </div>

        {/* Subject Score Cards */}
        <div className="grid px-6 grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {processedSubjects.map(({ name, marks }) => (
            <div
              key={name}
              className={`${subjectColors[name]} text-white flex flex-col gap-2 rounded-3xl py-5 px-4 font-semibold text-lg`}
            >
              <p className="text-2xl text-white">{name}</p>
              <p className="text-2xl text-white">{marks}</p>
            </div>
          ))}
        </div>

        {/* Stats Badges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs mb-6">
          <div className="bg-[#9BCD1326] border border-[#5A7B0040] text-[#759E05] px-2 py-2 rounded-xl font-medium">
            <p className="text-lg font-bold text-[#759E05]">Correct Answer</p>
            <p className="text-xl font-bold text-[#759E05]">
              {calculateCorrectAnswers()}
            </p>
          </div>
          <div className="bg-[#E3F2FD] border border-[#90CAF940] text-[#007ACC] px-2 py-2 rounded-xl font-medium">
            <p className="text-lg font-bold text-[#007ACC]">Attempted</p>
            <p className="text-xl font-bold text-[#007ACC]">{attempted}</p>
          </div>
          <div className="bg-[#3157D426] border border-[#2C4BB040] text-[#3457a1] px-2 py-2 rounded-xl font-medium">
            <p className="text-lg font-bold text-[#2C4BB0]">Unanswered</p>
            <p className="text-xl font-bold text-[#2C4BB0]">
              {questions.length - attempted}
            </p>
          </div>
          <div className="bg-[#D4319026] border border-[#C6428F40] text-[#b30c91] px-2 py-2 rounded-xl font-medium">
            <p className="text-lg font-bold text-[#C6428F]">Accuracy</p>
            <p className="text-xl font-bold text-[#C6428F]">
              {calculateAccuracy()}%
            </p>
          </div>
          <div className="bg-[#D4313126] border border-[#AA242440] text-[#b10000] px-2 py-2 rounded-xl font-medium">
            <p className="text-lg font-bold text-[#AA2424]">Wrong Answer</p>
            <p className="text-xl font-bold text-[#AA2424]">
              {calculateWrongAnswers()}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid md:flex gap-3 md:justify-between justify-center mt-4 bg-white md:rounded-full p-4 rounded-md border border-[#007ACC40]">
          <button
            style={{
              boxShadow: `
                0px 4px 8px 0px #00000040,
                -1px 15px 15px 0px #00000036,
                -3px 34px 20px 0px #00000021,
                -5px 60px 24px 0px #0000000A,
                -7px 94px 26px 0px #00000000
              `,
            }}
            onClick={() => setShowTypeResults(true)}
            className="bg-[#31CA31] text-white rounded-full py-4 px-4 font-semibold shadow hover:bg-[#009044]"
          >
            View Question Type Analysis
          </button>
          <button
            style={{
              boxShadow: `
                0px 4px 8px 0px #00000040,
                -1px 15px 15px 0px #00000036,
                -3px 34px 20px 0px #00000021,
                -5px 60px 24px 0px #0000000A,
                -7px 94px 26px 0px #00000000
              `,
            }}
            onClick={() => onShowAnswers?.(true)}
            className="bg-[#31CA31] text-white rounded-full py-4 px-4 font-semibold shadow hover:bg-[#009044]"
          >
            View Answers
          </button>
          <button
            style={{
              boxShadow: `
                0px 4px 8px 0px #00000040,
                -1px 15px 15px 0px #00000036,
                -3px 34px 20px 0px #00000021,
                -5px 60px 24px 0px #0000000A,
                -7px 94px 26px 0px #00000000
              `,
            }}
            onClick={() => router.push("/user/dashboard")}
            className="bg-[#31CA31] text-white rounded-full py-4 px-4 font-semibold shadow hover:bg-[#009044]"
          >
            Go Back to Another Test
          </button>
        </div>
      </div>

      {/* Type Analysis Popup */}
      {showTypeResults && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="bg-white w-[95%] md:w-[600px] rounded-[25px] overflow-hidden shadow-lg">
            {/* Header */}
            <div className="bg-[#007ACC] flex items-center gap-3 px-5 py-4 justify-center">
              <div className="bg-white p-2 rounded-full">
                <img
                  src="/images/practice/last-one.png"
                  alt="icon"
                  className="w-6 h-6 md:w-8 md:h-8"
                />
              </div>
              <h2 className="text-white text-lg md:text-2xl font-semibold">
                Question Type Analysis
              </h2>
            </div>

            {/* Body */}
            <div className="p-4 md:p-6 space-y-6 overflow-auto max-h-[600px] scrollbar-thin-custom">
              {Object.entries(resultsByType || {}).map(([typeId, typeData]) => (
                <div
                  key={typeId}
                  className="bg-[#F8FBFF] p-4 rounded-[14px] shadow-sm space-y-3"
                >
                  {/* Type Header */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-[15px] font-semibold text-[#333]">
                      {typeData.typeName}
                    </h3>
                    <div className="flex gap-2 text-xs md:text-sm">
                      <span className="bg-[#E3F2FD] text-[#007ACC] font-medium px-3 py-1 rounded-full">
                        Attempted: {typeData.attempted}
                      </span>
                      <span className="bg-[#E6F4EA] text-[#28A745] font-medium px-3 py-1 rounded-full">
                        Correct: {typeData.correct}
                      </span>
                      <span className="bg-[#FCECEC] text-[#D32F2F] font-medium px-3 py-1 rounded-full">
                        Wrong: {typeData.wrong}
                      </span>
                    </div>
                  </div>

                  {/* Subject Data */}
                  <div className="space-y-2">
                    {Object.entries(typeData.subjects || {}).map(
                      ([subjectId, subjectData]) => (
                        <div
                          key={subjectId}
                          className="flex justify-between items-center bg-white rounded-[10px] px-4 py-2 shadow-sm"
                        >
                          <span className="text-[14px] font-medium text-[#333]">
                            {subjectId}
                          </span>
                          <div className="flex gap-24 text-sm">
                            <span className="text-[#007ACC]">
                              ↻ {subjectData.attempted}
                            </span>
                            <span className="text-[#28A745]">
                              ✓ {subjectData.correct}
                            </span>
                            <span className="text-[#D32F2F]">
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

            {/* Close Button */}
            <div className="py-6 flex justify-center">
              <button
                onClick={() => setShowTypeResults(false)}
                className="bg-[#D32F2F] hover:bg-[#b91c1c] text-white px-8 py-2 rounded-full text-[16px] font-semibold"
                style={{
                  boxShadow: `
                    0px 4px 8px 0px #00000040,
                    -1px 15px 15px 0px #00000036,
                    -3px 34px 20px 0px #00000021,
                    -5px 60px 24px 0px #0000000A,
                    -7px 94px 26px 0px #00000000
                  `,
                }}
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
