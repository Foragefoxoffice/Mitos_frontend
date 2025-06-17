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

// Helper function to group subjects by grade
const groupSubjectsByGrade = (subjects) => {
  const gradeMap = {};
  
  Object.keys(subjects).forEach(subjectName => {
    // Extract grade from subject name (assuming format like "11 Physics")
    const gradeMatch = subjectName.match(/^(\d+)/);
    const grade = gradeMatch ? gradeMatch[0] : 'Other';
    
    if (!gradeMap[grade]) {
      gradeMap[grade] = [];
    }
    
    // Remove grade from subject name for cleaner display
    const cleanName = subjectName.replace(/^\d+\s*/, '').trim();
    gradeMap[grade].push({
      originalName: subjectName,
      displayName: cleanName
    });
  });
  
  // Sort grades numerically
  const sortedGrades = Object.keys(gradeMap).sort((a, b) => parseInt(a) - parseInt(b));
  const sortedGradeMap = {};
  sortedGrades.forEach(grade => {
    sortedGradeMap[grade] = gradeMap[grade];
  });
  
  return sortedGradeMap;
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

    // Process resultsByType with IDs
    Object.entries(resultsByType).forEach(([typeId, typeData]) => {
      const typeName = typeData.typeName || `Type ${typeId}`;
      
      if (!monthData.resultsByType[typeName]) {
        monthData.resultsByType[typeName] = { 
          typeId,
          attempted: 0, 
          correct: 0, 
          wrong: 0, 
          subjects: {} 
        };
      }
      
      monthData.resultsByType[typeName].attempted += typeData.attempted || 0;
      monthData.resultsByType[typeName].correct += typeData.correct || 0;
      monthData.resultsByType[typeName].wrong += typeData.wrong || 0;

      Object.entries(typeData.subjects || {}).forEach(([subjectName, subjectMetrics]) => {
        const subjectId = subjectMetrics.subjectId || 
                         (resultsBySubject[subjectName]?.subjectId) || 
                         Object.entries(resultsBySubject).find(([id, subj]) => subj.subjectName === subjectName)?.[0];
        
        if (!monthData.resultsByType[typeName].subjects[subjectName]) {
          monthData.resultsByType[typeName].subjects[subjectName] = { 
            subjectId,
            attempted: 0, 
            correct: 0, 
            wrong: 0 
          };
        }
        monthData.resultsByType[typeName].subjects[subjectName].attempted += subjectMetrics.attempted || 0;
        monthData.resultsByType[typeName].subjects[subjectName].correct += subjectMetrics.correct || 0;
        monthData.resultsByType[typeName].subjects[subjectName].wrong += subjectMetrics.wrong || 0;
      });
    });

    // Process resultsByChapter with IDs
    Object.entries(resultsByChapter).forEach(([chapterId, chapterData]) => {
      const chapterName = chapterData.chapterName || chapterId;
      const subjectName = chapterData.subject || "Unknown";
      const subjectId = chapterData.subjectId || 
                       (resultsBySubject[subjectName]?.subjectId) || 
                       Object.entries(resultsBySubject).find(([id, subj]) => subj.subjectName === subjectName)?.[0];
      
      if (!monthData.resultsByChapter[chapterName]) {
        monthData.resultsByChapter[chapterName] = { 
          chapterId,
          subjectId,
          attempted: 0, 
          correct: 0, 
          wrong: 0, 
          subjects: {} 
        };
      }
      
      monthData.resultsByChapter[chapterName].attempted += chapterData.attempted || 0;
      monthData.resultsByChapter[chapterName].correct += chapterData.correct || 0;
      monthData.resultsByChapter[chapterName].wrong += chapterData.wrong || 0;
      
      if (!monthData.resultsByChapter[chapterName].subjects[subjectName]) {
        monthData.resultsByChapter[chapterName].subjects[subjectName] = { 
          subjectId,
          attempted: 0, 
          correct: 0, 
          wrong: 0 
        };
      }
      
      monthData.resultsByChapter[chapterName].subjects[subjectName].attempted += chapterData.attempted || 0;
      monthData.resultsByChapter[chapterName].subjects[subjectName].correct += chapterData.correct || 0;
      monthData.resultsByChapter[chapterName].subjects[subjectName].wrong += chapterData.wrong || 0;
    });
  });

  // Sort and limit chapters by wrong answers for each subject
  monthMap.forEach((monthData) => {
    const chaptersBySubject = {};

    Object.entries(monthData.resultsByChapter).forEach(([chapterName, metrics]) => {
      Object.entries(metrics.subjects || {}).forEach(([subjectName, subjectMetrics]) => {
        if (!chaptersBySubject[subjectName]) {
          chaptersBySubject[subjectName] = [];
        }
        chaptersBySubject[subjectName].push({
          chapterName,
          chapterId: metrics.chapterId,
          subjectId: subjectMetrics.subjectId,
          wrong: subjectMetrics.wrong || 0,
          metrics,
        });
      });
    });

    // Sort chapters by wrong answers (descending) and limit to top 5
    Object.keys(chaptersBySubject).forEach((subjectName) => {
      chaptersBySubject[subjectName].sort((a, b) => b.wrong - a.wrong);
      chaptersBySubject[subjectName] = chaptersBySubject[subjectName].slice(0, 5);
    });

    // Update resultsByChapter with filtered chapters (preserving IDs)
    monthData.resultsByChapter = {};
    Object.entries(chaptersBySubject).forEach(([subjectName, chapters]) => {
      chapters.forEach(({ chapterName, chapterId, subjectId, metrics }) => {
        if (!monthData.resultsByChapter[chapterName]) {
          monthData.resultsByChapter[chapterName] = { 
            chapterId,
            subjectId,
            attempted: 0, 
            correct: 0, 
            wrong: 0, 
            subjects: {} 
          };
        }
        monthData.resultsByChapter[chapterName].attempted += metrics.attempted || 0;
        monthData.resultsByChapter[chapterName].correct += metrics.correct || 0;
        monthData.resultsByChapter[chapterName].wrong += metrics.wrong || 0;

        Object.entries(metrics.subjects || {}).forEach(([subjName, subjMetrics]) => {
          if (!monthData.resultsByChapter[chapterName].subjects[subjName]) {
            monthData.resultsByChapter[chapterName].subjects[subjName] = { 
              subjectId: subjMetrics.subjectId,
              attempted: 0, 
              correct: 0, 
              wrong: 0 
            };
          }
          monthData.resultsByChapter[chapterName].subjects[subjName].attempted += subjMetrics.attempted || 0;
          monthData.resultsByChapter[chapterName].subjects[subjName].correct += subjMetrics.correct || 0;
          monthData.resultsByChapter[chapterName].subjects[subjName].wrong += subjMetrics.wrong || 0;
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
      {groupedResults.map((monthData) => {
        // Get all unique subjects from resultsByType
        const typeSubjects = {};
        Object.values(monthData.resultsByType || {}).forEach(type => {
          Object.entries(type.subjects || {}).forEach(([subjectName, metrics]) => {
            typeSubjects[subjectName] = metrics;
          });
        });
        
        // Get all unique subjects from resultsByChapter
        const chapterSubjects = {};
        Object.values(monthData.resultsByChapter || {}).forEach(chapter => {
          Object.entries(chapter.subjects || {}).forEach(([subjectName, metrics]) => {
            chapterSubjects[subjectName] = metrics;
          });
        });

        // Group subjects by grade
        const groupedTypeSubjects = groupSubjectsByGrade(typeSubjects);
        const groupedChapterSubjects = groupSubjectsByGrade(chapterSubjects);

        return (
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
                  groupedSubjects={groupedTypeSubjects}
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
                  groupedSubjects={groupedChapterSubjects}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResultsByMonth;