"use client";
import React, { useState } from "react";
import { useSelectedQuestionTypes } from "@/contexts/SelectedQuestionTypesContext";
import { useRouter } from "next/navigation";

const SubjectTabs = ({ monthData, section }) => {
  const router = useRouter();
  const {
    selectedQuestionTypes,
    setSelectedQuestionTypes,
    chapterId,
    setChapterId,
    subject,
    setSubject,
    subjectId,
    setSubjectId,
  } = useSelectedQuestionTypes();

  const subjects = new Set();
  Object.values(monthData[section]).forEach((data) => {
    Object.keys(data.subjects).forEach((subject) => subjects.add(subject));
  });

  const [activeSubject, setActiveSubject] = useState([...subjects][0] || "");

  const handlePracticeNavigation = (chapterName, chapterData) => {
    const subjectStats = chapterData.subjects[activeSubject];
    const selectedSubjectId = subjectStats?.subjectId;

    setSubject(activeSubject);
    setSubjectId(selectedSubjectId);

    if (section === "resultsByType") {
      setSelectedQuestionTypes([chapterData.typeId]);
    } else if (section === "resultsByChapter") {
      setChapterId(chapterData.chapterId);
    }

    router.push("/user/practice");
  };

  const mergeChapterData = (data) => {
    const mergedData = {};

    Object.entries(data).forEach(([chapter, details]) => {
      if (!mergedData[chapter]) {
        mergedData[chapter] = {
          ...details,
          attempted: 0,
          correct: 0,
          wrong: 0,
          subjects: {},
        };
      }

      mergedData[chapter].attempted += details.attempted;
      mergedData[chapter].correct += details.correct;
      mergedData[chapter].wrong += details.wrong;

      Object.entries(details.subjects).forEach(([subject, stats]) => {
        if (!mergedData[chapter].subjects[subject]) {
          mergedData[chapter].subjects[subject] = {
            subjectId: stats.subjectId,
            attempted: 0,
            correct: 0,
            wrong: 0,
          };
        }

        mergedData[chapter].subjects[subject].attempted += stats.attempted;
        mergedData[chapter].subjects[subject].correct += stats.correct;
        mergedData[chapter].subjects[subject].wrong += stats.wrong;
      });
    });

    return mergedData;
  };

  const mergedChapterData =
    section === "resultsByChapter"
      ? mergeChapterData(monthData[section])
      : monthData[section];

  const calculateAccuracy = (correct, attempted) => {
    if (attempted === 0) return 0;
    return ((correct / attempted) * 100).toFixed(2);
  };

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
    <div>
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#35095e]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                {section === "resultsByChapter" ? "Chapter" : "Type"}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Attempted</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Correct</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Wrong</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Correct %</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Wrong %</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(mergedChapterData)
              .filter(([_, metrics]) => metrics.subjects[activeSubject])
              .sort(([, a], [, b]) => {
                const aData = a.subjects[activeSubject];
                const bData = b.subjects[activeSubject];
                const aWrongPct = aData.attempted > 0 ? (aData.wrong / aData.attempted) : 0;
                const bWrongPct = bData.attempted > 0 ? (bData.wrong / bData.attempted) : 0;
                return bWrongPct - aWrongPct;
              })
              .map(([chapter, metrics]) => {
                const subjectData = metrics.subjects[activeSubject];
                const { attempted, correct, wrong } = subjectData;
                const accuracy = calculateAccuracy(correct, attempted);
                const correctAccuracy = calculateAccuracy(correct, attempted);
                const wrongAccuracy = calculateAccuracy(wrong, attempted);

                return (
                  <tr key={chapter}>
                    <td className="flex gap-3 item-center px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      <div className="flex justify-center">
                        <CircularProgress percentage={parseFloat(accuracy)} />
                      </div>
                      <p className="flex items-center">{chapter}</p>
                    </td>
                    <td className="px-6 py-4 text-center">{attempted}</td>
                    <td className="px-6 py-4 text-center">{correct}</td>
                    <td className="px-6 py-4 text-center text-red-500">{wrong}</td>
                    <td className="px-6 py-4 text-center text-blue-600">{correctAccuracy}%</td>
                    <td className="px-6 py-4 text-center text-red-600">{wrongAccuracy}%</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handlePracticeNavigation(chapter, metrics)}
                        className="px-3 py-1 bg-[#35095e] text-white rounded hover:bg-[#4a0d7a] transition-colors"
                      >
                        Practice
                      </button>
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
