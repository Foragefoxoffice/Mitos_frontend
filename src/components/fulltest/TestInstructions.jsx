"use client";
import React from "react";

export const TestInstructions = ({ setShowInstructionPopup }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
      <div className="question_popup">
        <h2>Test Instructions</h2>
        <ul>
          <li>Each question takes 1 minute, So total number of questions X 1min for total test time. (Time is for whole test)</li>
          <li>4 buttons for navigation <strong className="text-[#35095E]">"Previous question" "Mark for Review" "Next Question".</strong></li>
          <li>Questions will have side box for navigating to any question.</li>
          <li>Attempted question – <span className="font-extrabold  inline-block w-3 h-3 rounded-full bg-[#35095e]"></span></li>
          <li>Left question – <span className="font-extrabold inline-block w-3 h-3 rounded-full bg-[#e49331]"></span></li>
          <li>Unvisited question – <span className="font-extrabold inline-block w-3 h-3 rounded-full bg-[#b19cbe]"></span></li>
          <li>Mark as Review – <span className="font-extrabold inline-block w-3 h-3 rounded-full bg-[#498fe0]"></span></li>
        </ul>
        <button
          className="btn mx-auto py-2"
          onClick={() => setShowInstructionPopup(false)}
        >
          Take your Test
        </button>
      </div>
    </div>
  );
};