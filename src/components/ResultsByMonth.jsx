import React from "react";
import { format } from "date-fns";
import SubjectTabs from "@/components/SubjectTabs";


const groupResultsByMonth = (results) => {
  const monthMap = new Map();

  results.forEach((test) => {
    if (!test.createdAt) return;

    const testDate = new Date(test.createdAt);
    const monthLabel = format(testDate, "MMM yyyy"); // "Feb 2025", "Mar 2025"

    if (!monthMap.has(monthLabel)) {
      monthMap.set(monthLabel, {
        resultsByType: {},
        resultsByChapter: {},
      });
    }

    const monthData = monthMap.get(monthLabel);

    // Combine resultsByType
    Object.entries(test.resultsByType || {}).forEach(([type, metrics]) => {
      if (!monthData.resultsByType[type]) {
        monthData.resultsByType[type] = { attempted: 0, correct: 0, wrong: 0, subjects: {} };
      }
      monthData.resultsByType[type].attempted += metrics.attempted;
      monthData.resultsByType[type].correct += metrics.correct;
      monthData.resultsByType[type].wrong += metrics.wrong;

      Object.entries(metrics.subjects || {}).forEach(([subject, subjectMetrics]) => {
        if (!monthData.resultsByType[type].subjects[subject]) {
          monthData.resultsByType[type].subjects[subject] = { attempted: 0, correct: 0, wrong: 0 };
        }
        monthData.resultsByType[type].subjects[subject].attempted += subjectMetrics.attempted;
        monthData.resultsByType[type].subjects[subject].correct += subjectMetrics.correct;
        monthData.resultsByType[type].subjects[subject].wrong += subjectMetrics.wrong;
      });
    });

    // Combine resultsByChapter
    Object.entries(test.resultsByChapter || {}).forEach(([chapter, metrics]) => {
      if (!monthData.resultsByChapter[chapter]) {
        monthData.resultsByChapter[chapter] = { attempted: 0, correct: 0, wrong: 0, subjects: {} };
      }
      monthData.resultsByChapter[chapter].attempted += metrics.attempted;
      monthData.resultsByChapter[chapter].correct += metrics.correct;
      monthData.resultsByChapter[chapter].wrong += metrics.wrong;

      // Ensure subjects is an object
      const subject = metrics.subjects || "Unknown"; // Fallback to "Unknown" if subjects is not provided
      if (!monthData.resultsByChapter[chapter].subjects[subject]) {
        monthData.resultsByChapter[chapter].subjects[subject] = { attempted: 0, correct: 0, wrong: 0 };
      }
      monthData.resultsByChapter[chapter].subjects[subject].attempted += metrics.attempted;
      monthData.resultsByChapter[chapter].subjects[subject].correct += metrics.correct;
      monthData.resultsByChapter[chapter].subjects[subject].wrong += metrics.wrong;
    });
  });

  // Sort and limit chapters by wrong answers for each subject
  monthMap.forEach((monthData) => {
    const chaptersBySubject = {};

    Object.entries(monthData.resultsByChapter).forEach(([chapter, metrics]) => {
      Object.entries(metrics.subjects).forEach(([subject, subjectMetrics]) => {
        if (!chaptersBySubject[subject]) {
          chaptersBySubject[subject] = [];
        }
        chaptersBySubject[subject].push({
          chapter,
          wrong: subjectMetrics.wrong,
          metrics,
        });
      });
    });

    // Sort chapters by wrong answers (descending) and limit to top 5
    Object.keys(chaptersBySubject).forEach((subject) => {
      chaptersBySubject[subject].sort((a, b) => b.wrong - a.wrong);
      chaptersBySubject[subject] = chaptersBySubject[subject].slice(0, 5);
    });

    // Update resultsByChapter with filtered chapters
    monthData.resultsByChapter = {};
    Object.entries(chaptersBySubject).forEach(([subject, chapters]) => {
      chapters.forEach(({ chapter, metrics }) => {
        if (!monthData.resultsByChapter[chapter]) {
          monthData.resultsByChapter[chapter] = { attempted: 0, correct: 0, wrong: 0, subjects: {} };
        }
        monthData.resultsByChapter[chapter].attempted += metrics.attempted;
        monthData.resultsByChapter[chapter].correct += metrics.correct;
        monthData.resultsByChapter[chapter].wrong += metrics.wrong;

        Object.entries(metrics.subjects || {}).forEach(([subject, subjectMetrics]) => {
          if (!monthData.resultsByChapter[chapter].subjects[subject]) {
            monthData.resultsByChapter[chapter].subjects[subject] = { attempted: 0, correct: 0, wrong: 0 };
          }
          monthData.resultsByChapter[chapter].subjects[subject].attempted += subjectMetrics.attempted;
          monthData.resultsByChapter[chapter].subjects[subject].correct += subjectMetrics.correct;
          monthData.resultsByChapter[chapter].subjects[subject].wrong += subjectMetrics.wrong;
        });
      });
    });
  });

  return Array.from(monthMap.entries()).map(([monthLabel, data]) => ({ monthLabel, ...data })).reverse();
};

const ResultsByMonth = ({ results, selectedSubject }) => {
  const groupedResults = groupResultsByMonth(results);

  return (
    <div>
      {groupedResults.map((monthData) => (
        <div key={monthData.monthLabel} className="mb-6">
          <h2 className="text-xl font-bold">{monthData.monthLabel}</h2>

          <h3 className="text-lg font-bold mt-4">Results by Type</h3>
          <SubjectTabs monthData={monthData} section="resultsByType" selectedSubject={selectedSubject} />

          <h3 className="text-lg font-bold mt-4">Results by Chapter</h3>
          <SubjectTabs monthData={monthData} section="resultsByChapter" selectedSubject={selectedSubject} />
        </div>
      ))}
    </div>
  );
};
export default ResultsByMonth;
