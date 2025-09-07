"use client";
import React from "react";
import Image from "next/image";
// import instructionImg from "images/practice/11th-biology.png"; // Replace with your actual image path

export const TestInstructions = ({ setShowInstructionPopup }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#f5faff] w-full max-w-4xl rounded-xl overflow-auto md:overflow-hidden h-[100%] md:h-[auto] shadow-lg flex flex-col md:flex-row">
        <div className="w-[90%] border-[1px] border-[#007ACC40] md:w-1/2 bg-white p-4 m-6 grid rounded-lg justify-items-center text-center">
          <img
            src="/images/practice/Instructions-logo.png"
            alt="Instructions Banner"
            className="w-50 h-auto object-contain"
          />
          <img
            src="/images/practice/Instructions.png"
            alt="Instructions Banner"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Right Side - Instructions */}
        <div className="w-full md:w-1/2 p-6 bg-[#f5faff] relative">
          <h2 className="text-xl md:text-4xl font-bold text-white bg-[#007ACC] px-4 py-3 rounded mb-4 text-center">
            Instructions
          </h2>
          <ul className="text-sm space-y-2 text-gray-700 list-decimal pl-5">
            <li className="pb-4">
              Each correctly answered question carries 4 marks.
            </li>
            <li className="pb-4">
              Each wrongly answered question deducts 1 mark.
            </li>
            <li className="pb-4">
              4 buttons for navigation: <strong>“Previous Question”</strong>,{" "}
              <strong>“Mark for Review”</strong>, <strong>“Next”</strong>,{" "}
              <strong>“Questions”</strong>.
            </li>
            <li className="pb-4">
              Questions will have pop-up box for navigating to any subject or
              question.
            </li>
            <li className="pb-4">
              Timer will be based on NEET standard (Approx 1 minute per
              question)
            </li>
            <li className="pb-4">
              No corrections can be made after submitting the exam.
            </li>
            {/* <li className="pb-4">
              Attempted question —{" "}
              <span className="inline-block w-3 h-3 rounded-full bg-green-600 ml-2"></span>
            </li>
            <li className="pb-4">
              Left question —{" "}
              <span className="inline-block w-3 h-3 rounded-full bg-gray-400 ml-2"></span>
            </li>
            <li className="pb-4">
              Marked for review —{" "}
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 ml-2"></span>
            </li> */}
          </ul>
          <div className="mt-4 mb-2 text-center">
            <span className="inline-block px-6 py-2 text-lg md:text-xl font-extrabold tracking-wide bg-gradient-to-r from-[#007ACC]  to-[#9b00e8] text-white rounded-full shadow-lg shadow-[#e52e71]/30 animate-pulse">
              🎯 Best of Luck! 🎯
            </span>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-between">
            <a
              className="bg-[#d0efe4] text-[#004d3c] px-8 py-2 rounded-full font-medium shadow"
               href="/user/dashboard"
            >
              Back
            </a>
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
              className="bg-[#31CA31] hover:bg-green-600 text-white px-5 py-2 font-medium shadow rounded-full"
              onClick={() => setShowInstructionPopup(false)}
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
