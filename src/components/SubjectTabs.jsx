import React, { useState } from "react";

const SubjectTabs = ({ monthData, section }) => {
  const subjects = new Set();

  // Collect all subjects
  Object.values(monthData[section]).forEach((data) => {
    Object.keys(data.subjects).forEach((subject) => subjects.add(subject));
  });

  const [activeSubject, setActiveSubject] = useState([...subjects][0] || "");

  // Helper function to merge chapter data
  const mergeChapterData = (data) => {
    const mergedData = {};

    Object.entries(data).forEach(([chapter, details]) => {
      if (!mergedData[chapter]) {
        mergedData[chapter] = { attempted: 0, correct: 0, wrong: 0, subjects: {} };
      }

      // Aggregate chapter-level data
      mergedData[chapter].attempted += details.attempted;
      mergedData[chapter].correct += details.correct;
      mergedData[chapter].wrong += details.wrong;

      // Aggregate subject-wise data
      Object.entries(details.subjects).forEach(([subject, stats]) => {
        if (!mergedData[chapter].subjects[subject]) {
          mergedData[chapter].subjects[subject] = { attempted: 0, correct: 0, wrong: 0 };
        }

        mergedData[chapter].subjects[subject].attempted += stats.attempted;
        mergedData[chapter].subjects[subject].correct += stats.correct;
        mergedData[chapter].subjects[subject].wrong += stats.wrong;
      });
    });

    return mergedData;
  };

  const mergedChapterData = section === "resultsByChapter" ? mergeChapterData(monthData[section]) : monthData[section];

  // Helper function to calculate accuracy
  const calculateAccuracy = (correct, attempted) => {
    if (attempted === 0) return 0; // Avoid division by zero
    return ((correct / attempted) * 100).toFixed(2); // Round to 2 decimal places
  };

  return (
    <div className="mb-4">
      {/* Subject Tabs */}
      <div className="flex space-x-4 mb-2">
        {[...subjects].map((subject) => (
          <button
            key={subject}
            className={`px-4 py-2 rounded ${activeSubject === subject ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveSubject(subject)}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Data Display */}
      <div className="bg-gray-100 p-4 rounded-lg">
        {Object.entries(mergedChapterData).map(([chapter, metrics]) => {
          // Filter & Sort only for Chapters
          if (section === "resultsByChapter") {
            if (!metrics.subjects[activeSubject]) return null; // Skip if no data for this subject

            const accuracy = calculateAccuracy(
              metrics.subjects[activeSubject].correct,
              metrics.subjects[activeSubject].attempted
            );

            return (
              <div key={chapter} className="mb-2">
                <h4 className="font-bold">{chapter}</h4>
                <div className="ml-4">
                  <p>Attempted: {metrics.subjects[activeSubject].attempted}</p>
                  <p>Correct: {metrics.subjects[activeSubject].correct}</p>
                  <p className="text-red-500">Wrong: {metrics.subjects[activeSubject].wrong}</p>
                  <p className="text-green-500">Accuracy: {accuracy}%</p>
                </div>
              </div>
            );
          }

          // Default display for resultsByType
          if (!metrics.subjects[activeSubject]) return null; // Skip if no data for this subject

          const accuracy = calculateAccuracy(
            metrics.subjects[activeSubject].correct,
            metrics.subjects[activeSubject].attempted
          );

          return (
            <div key={chapter}>
              <h4 className="font-bold">{chapter}</h4>
              <div className="ml-4">
                <p>Attempted: {metrics.subjects[activeSubject].attempted}</p>
                <p>Correct: {metrics.subjects[activeSubject].correct}</p>
                <p className="text-red-500">Wrong: {metrics.subjects[activeSubject].wrong}</p>
                <p className="text-green-500">Accuracy: {accuracy}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectTabs;