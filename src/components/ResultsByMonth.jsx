import React from "react";
import { format } from "date-fns";
import SubjectTabs from "@/components/SubjectTabs";

// Helper function to safely parse JSON strings
const safeParse = (str) => {
  try {
    return str ? JSON.parse(str) : {};
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return {};
  }
};

const groupResultsByMonth = (results) => {
  const monthMap = new Map();

  results.forEach((test) => {
    if (!test.createdAt) return;

    // Parse the stringified JSON fields
    const resultsByType = safeParse(test.resultsByType);
    const resultsByChapter = safeParse(test.resultsByChapter);
    const resultsBySubject = safeParse(test.resultsBySubject);

    const testDate = new Date(test.createdAt);
    const monthLabel = format(testDate, "MMM yyyy");

    if (!monthMap.has(monthLabel)) {
      monthMap.set(monthLabel, {
        resultsByType: {},
        resultsByChapter: {},
      });
    }

    const monthData = monthMap.get(monthLabel);

    // Process resultsByType
   Object.entries(resultsByType).forEach(([typeId, typeData]) => {
      const typeName = typeData.typeName || `Type ${typeId}`; // Use stored typeName or fallback
      
      if (!monthData.resultsByType[typeName]) {
        monthData.resultsByType[typeName] = { 
          attempted: 0, 
          correct: 0, 
          wrong: 0, 
          subjects: {} 
        };
      }
      
      monthData.resultsByType[typeName].attempted += typeData.attempted || 0;
      monthData.resultsByType[typeName].correct += typeData.correct || 0;
      monthData.resultsByType[typeName].wrong += typeData.wrong || 0;

      Object.entries(typeData.subjects || {}).forEach(([subject, subjectMetrics]) => {
        if (!monthData.resultsByType[typeName].subjects[subject]) {
          monthData.resultsByType[typeName].subjects[subject] = { 
            attempted: 0, 
            correct: 0, 
            wrong: 0 
          };
        }
        monthData.resultsByType[typeName].subjects[subject].attempted += subjectMetrics.attempted || 0;
        monthData.resultsByType[typeName].subjects[subject].correct += subjectMetrics.correct || 0;
        monthData.resultsByType[typeName].subjects[subject].wrong += subjectMetrics.wrong || 0;
      });
    });


    // Process resultsByChapter
    Object.entries(resultsByChapter).forEach(([chapterId, chapterData]) => {
      const chapterName = chapterData.chapterName || chapterId;
      const subject = chapterData.subject || "Unknown";
      
      if (!monthData.resultsByChapter[chapterName]) {
        monthData.resultsByChapter[chapterName] = { 
          attempted: 0, 
          correct: 0, 
          wrong: 0, 
          subjects: {} 
        };
      }
      
      monthData.resultsByChapter[chapterName].attempted += chapterData.attempted || 0;
      monthData.resultsByChapter[chapterName].correct += chapterData.correct || 0;
      monthData.resultsByChapter[chapterName].wrong += chapterData.wrong || 0;
      
      if (!monthData.resultsByChapter[chapterName].subjects[subject]) {
        monthData.resultsByChapter[chapterName].subjects[subject] = { 
          attempted: 0, 
          correct: 0, 
          wrong: 0 
        };
      }
      
      monthData.resultsByChapter[chapterName].subjects[subject].attempted += chapterData.attempted || 0;
      monthData.resultsByChapter[chapterName].subjects[subject].correct += chapterData.correct || 0;
      monthData.resultsByChapter[chapterName].subjects[subject].wrong += chapterData.wrong || 0;
    });
  });

  // Sort and limit chapters by wrong answers for each subject
  monthMap.forEach((monthData) => {
    const chaptersBySubject = {};

    Object.entries(monthData.resultsByChapter).forEach(([chapterName, metrics]) => {
      Object.entries(metrics.subjects || {}).forEach(([subject, subjectMetrics]) => {
        if (!chaptersBySubject[subject]) {
          chaptersBySubject[subject] = [];
        }
        chaptersBySubject[subject].push({
          chapterName,
          wrong: subjectMetrics.wrong || 0,
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
      chapters.forEach(({ chapterName, metrics }) => {
        if (!monthData.resultsByChapter[chapterName]) {
          monthData.resultsByChapter[chapterName] = { 
            attempted: 0, 
            correct: 0, 
            wrong: 0, 
            subjects: {} 
          };
        }
        monthData.resultsByChapter[chapterName].attempted += metrics.attempted || 0;
        monthData.resultsByChapter[chapterName].correct += metrics.correct || 0;
        monthData.resultsByChapter[chapterName].wrong += metrics.wrong || 0;

        Object.entries(metrics.subjects || {}).forEach(([subject, subjectMetrics]) => {
          if (!monthData.resultsByChapter[chapterName].subjects[subject]) {
            monthData.resultsByChapter[chapterName].subjects[subject] = { 
              attempted: 0, 
              correct: 0, 
              wrong: 0 
            };
          }
          monthData.resultsByChapter[chapterName].subjects[subject].attempted += subjectMetrics.attempted || 0;
          monthData.resultsByChapter[chapterName].subjects[subject].correct += subjectMetrics.correct || 0;
          monthData.resultsByChapter[chapterName].subjects[subject].wrong += subjectMetrics.wrong || 0;
        });
      });
    });
  });

  return Array.from(monthMap.entries()).map(([monthLabel, data]) => ({ 
    monthLabel, 
    ...data 
  })).reverse();
};

const ResultsByMonth = ({ results, selectedSubject }) => {
  // Ensure results is an array
  const validResults = Array.isArray(results) ? results : [];
  
  const groupedResults = groupResultsByMonth(validResults);

  return (
    <div>
      {groupedResults.map((monthData) => (
        <div key={monthData.monthLabel} className="mb-6">
          <h2 className="text-3xl text-[#35095e] text-center font-bold mb-5">
            {monthData.monthLabel} Wrong Ans Analysis
          </h2>
          <div className="grid gap-7">
            <div className="p-6 border border-gray-200 transition-shadow duration-300 rounded-lg bg-white">
              <h3 className="text-xl text-[#35095e] font-bold mb-5">
                Wrong Ans Analysis by Question Type
              </h3>
              <SubjectTabs 
                monthData={monthData} 
                section="resultsByType" 
                selectedSubject={selectedSubject} 
              />
            </div>
            <div className="p-6 border border-gray-200 transition-shadow duration-300 rounded-lg bg-white">
              <h3 className="text-xl text-[#35095e] font-bold mb-5">
                Wrong Ans Analysis by Chapter
              </h3>
              <SubjectTabs 
                monthData={monthData} 
                section="resultsByChapter" 
                selectedSubject={selectedSubject} 
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultsByMonth;