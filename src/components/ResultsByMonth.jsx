import React, { useState } from "react";
import { format } from "date-fns";
import { FiChevronDown, FiChevronUp, FiCalendar } from "react-icons/fi";
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
    const monthKey = format(testDate, "yyyy-MM");

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        monthLabel,
        resultsByType: {},
        resultsByChapter: {},
      });
    }

    const monthData = monthMap.get(monthKey);

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

  return Array.from(monthMap.entries()).map(([monthKey, data]) => ({ 
    monthKey,
    ...data 
  })).sort((a, b) => new Date(b.monthKey) - new Date(a.monthKey));
};

const ResultsByMonth = ({ results, selectedSubject }) => {
  // Ensure results is an array
  const validResults = Array.isArray(results) ? results : [];
  
  const groupedResults = groupResultsByMonth(validResults);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Default to the most recent month if available
    return groupedResults.length > 0 ? groupedResults[0].monthKey : '';
  });
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

  // Get the selected month data
  const selectedMonthData = groupedResults.find(month => month.monthKey === selectedMonth);

  // Get all available months for the dropdown
  const availableMonths = groupedResults.map(month => ({
    key: month.monthKey,
    label: month.monthLabel,
    monthData: month
  }));

  if (groupedResults.length === 0) {
    return (
      <div className="bg-white p-8 text-center rounded-xl">
        <p className="text-gray-500 text-lg">
          No test results available to display analysis.
        </p>
      </div>
    );
  }

  if (!selectedMonthData) {
    return (
      <div className="bg-white p-8 text-center rounded-xl">
        <p className="text-gray-500 text-lg">
          No data available for selected month.
        </p>
      </div>
    );
  }

  // Get all unique subjects from resultsByType
  const typeSubjects = {};
  Object.values(selectedMonthData.resultsByType || {}).forEach(type => {
    Object.entries(type.subjects || {}).forEach(([subjectName, metrics]) => {
      typeSubjects[subjectName] = metrics;
    });
  });
  
  // Get all unique subjects from resultsByChapter
  const chapterSubjects = {};
  Object.values(selectedMonthData.resultsByChapter || {}).forEach(chapter => {
    Object.entries(chapter.subjects || {}).forEach(([subjectName, metrics]) => {
      chapterSubjects[subjectName] = metrics;
    });
  });

  // Group subjects by grade
  const groupedTypeSubjects = groupSubjectsByGrade(typeSubjects);
  const groupedChapterSubjects = groupSubjectsByGrade(chapterSubjects);

  // Enhanced MonthSelector component
const MonthSelector = () => {
  const currentDate = new Date(selectedMonth);
  const formattedCurrentMonth = format(currentDate, 'MMMM yyyy');

  return (
    <div className="flex justify-end mb-8 relative">
      <div
        className="relative w-full max-w-xs cursor-pointer"
        onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-[#35095e] transition-colors duration-200">
          <div className="flex items-center">
            <FiCalendar className="text-[#35095e] mr-3 text-lg" />
            <span className="text-lg font-medium text-gray-800">
              {formattedCurrentMonth}
            </span>
          </div>
          {isMonthDropdownOpen ? (
            <FiChevronUp className="text-gray-500 text-lg" />
          ) : (
            <FiChevronDown className="text-gray-500 text-lg" />
          )}
        </div>

        {isMonthDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {availableMonths.map((month) => (
                <div
                  key={month.key}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                    selectedMonth === month.key ? 'bg-[#35095e10]' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMonth(month.key);
                    setIsMonthDropdownOpen(false);
                  }}
                >
                  <span
                    className={`font-medium ${
                      selectedMonth === month.key ? 'text-[#35095e]' : 'text-gray-700'
                    }`}
                  >
                    {month.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              Showing {availableMonths.length} month{availableMonths.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {isMonthDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsMonthDropdownOpen(false)}
        />
      )}
    </div>
  );
};


  return (
    <div className="bg-white rounded-xl p-6">
      {/* Month Selector */}
      <MonthSelector />

      <div key={selectedMonthData.monthKey} className="mb-6">
        <h2 className="text-3xl text-[#35095e] text-center font-bold mb-5">
          {selectedMonthData.monthLabel} Wrong Answer Analysis
        </h2>
        
        <div className="grid gap-7">
          {/* Question Type Analysis */}
          <div className="p-6 border border-gray-200 transition-shadow duration-300 rounded-lg bg-white hover:shadow-md">
            <h3 className="text-xl text-[#35095e] font-bold mb-5">
              Wrong Answer Analysis by Question Type
            </h3>
            <SubjectTabs 
              monthData={selectedMonthData} 
              section="resultsByType" 
              selectedSubject={selectedSubject}
              groupedSubjects={groupedTypeSubjects}
            />
          </div>
          
          {/* Chapter Analysis */}
          <div className="p-6 border border-gray-200 transition-shadow duration-300 rounded-lg bg-white hover:shadow-md">
            <h3 className="text-xl text-[#35095e] font-bold mb-5">
              Wrong Answer Analysis by Chapter
            </h3>
            <SubjectTabs 
              monthData={selectedMonthData} 
              section="resultsByChapter" 
              selectedSubject={selectedSubject}
              groupedSubjects={groupedChapterSubjects}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsByMonth;