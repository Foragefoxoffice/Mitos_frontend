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
    if (attempted === 0) return 0;
    return ((correct / attempted) * 100).toFixed(2);
  };

  // Circular progress component
  const CircularProgress = ({ percentage }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 50 50">
          <circle
            className="text-gray-200"
            strokeWidth="5"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="25"
            cy="25"
          />
          <circle
            className="text-[#FF5252]"
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="25"
            cy="25"
            transform="rotate(-90 25 25)"
          />
        </svg>
        
      </div>
    );
  };

  return (
    <div className="">
      {/* Subject Tabs */}
      <div className="flex space-x-4 mb-6">
        {[...subjects].map((subject) => (
          <button
            key={subject}
            className={`px-4 py-2 rounded ${
              activeSubject === subject
                ? "bg-[#35095e] text-white"
                : "bg-white text-[#35095e] border border-gray-200 hover:bg-[#35095e] hover:text-white duration-300"
            }`}
            onClick={() => setActiveSubject(subject)}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Table Display */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#35095e]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                {section === "resultsByChapter" ? "Chapter" : "Type"}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                Attempted
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                Correct
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                Wrong
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                Accuracy
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(mergedChapterData).map(([chapter, metrics]) => {
              if (!metrics.subjects[activeSubject]) return null;

              const accuracy = calculateAccuracy(
                metrics.subjects[activeSubject].correct,
                metrics.subjects[activeSubject].attempted
              );

              return (
                <tr key={chapter}>
                  <td className="flex gap-3 item-center px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  <div className="flex justify-center">
                      <CircularProgress percentage={parseFloat(accuracy)} />
                    </div>
                    <p className="flex items-center" >
                    {chapter}

                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {metrics.subjects[activeSubject].attempted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {metrics.subjects[activeSubject].correct}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-red-500">
                    {metrics.subjects[activeSubject].wrong}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-green-500">
                    {accuracy}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubjectTabs;