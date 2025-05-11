"use client";
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  LineChart,
  CartesianGrid,
  ReferenceLine,
  Label
} from "recharts";
import { format, startOfMonth } from "date-fns";

// Constants for reusable styles and configurations
const CHART_MARGIN = { top: 20, right: 30, left: 20, bottom: 60 };
const AXIS_STYLE = { 
  fontSize: 12, 
  fill: "#555", 
  fontWeight: "500" 
};
const GRID_STYLE = { 
  strokeDasharray: "3 3", 
  vertical: false, 
  stroke: "#e0e0e0" 
};

// Color mappings for consistency
const COLOR_MAP = {
  "Correct": "#4CAF50",
  "Wrong": "#EF5350",
  "Unanswered": "#78909C",
  "Overall Accuracy": "#FF9800",
  "Accuracy": "#4E79A7" // Base color for subject accuracies (overridden by specific colors)
};

const SUBJECT_COLORS = [
  "#4E79A7", // Blue
  "#F28E2B", // Orange
  "#E15759", // Red
  "#76B7B2", // Teal
  "#59A14F", // Green
  "#EDC948", // Yellow
  "#B07AA1", // Purple
  "#FF9DA7", // Pink
  "#9C755F", // Brown
  "#BAB0AC"  // Gray
];

const getSubjectColor = (subjectName) => {
  // Create a simple hash from the subject name to get consistent colors
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
      <p className="font-bold text-gray-800 mb-2">{label}</p>
      <div className="space-y-1">
        {payload
          .filter(entry => entry.value !== undefined) // Filter out undefined values
          .map((entry, index) => {
            let color;
            let displayName = entry.name;

            // Handle subject accuracy entries
            if (entry.name.endsWith(" Accuracy") && entry.name !== "Overall Accuracy") {
              const subject = entry.name.replace(" Accuracy", "");
              color = getSubjectColor(subject);
              displayName = subject; // Show just the subject name in tooltip
            } else {
              color = COLOR_MAP[entry.name] || entry.color || "#888";
            }

            return (
              <div key={`tooltip-item-${index}`} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-600 font-medium">{displayName}:</span>
                <span className="ml-1 font-semibold">
                  {entry.value}{entry.name.includes("Accuracy") ? "%" : ""}
                </span>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => {
        // Determine color
        let color = entry.color;
        if (entry.value.includes("Accuracy")) {
          if (entry.value === "Overall Accuracy") {
            color = COLOR_MAP["Overall Accuracy"];
          } else {
            const subject = entry.value.replace(" Accuracy", "");
            color = getSubjectColor(subject);
          }
        } else {
          color = COLOR_MAP[entry.value] || entry.color;
        }

        return (
          <div key={`legend-${index}`} className="flex items-center">
            <div 
              className="w-4 h-4 rounded mr-2" 
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="text-sm text-gray-700">{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function ChartResultsByWeek({ results = [] }) {
  // Early return if no data
  if (!results.length) {
    return (
      <div className="bg-white p-8 text-center rounded-xl">
        <p className="text-gray-500 text-lg">
          No test results available to display charts.
        </p>
      </div>
    );
  }

// Add this helper function at the top of your file
const safeParse = (str) => {
  try {
    return str ? JSON.parse(str) : {};
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return {};
  }
};

// Then modify the useMemo block where you process the results:
const { weeklyResults, subjectWeeklyResults } = useMemo(() => {
  const monthMap = new Map();
  const subjectMonthMap = new Map();

  results.forEach((test) => {
    if (!test?.createdAt) return;

    try {
      const testDate = new Date(test.createdAt);
      const monthStart = startOfMonth(testDate);
      const monthLabel = format(monthStart, "MMMM yyyy");
      const monthShort = format(monthStart, "MMM");

      // Initialize month data if not exists
      if (!monthMap.has(monthLabel)) {
        const weeks = Array.from({ length: 4 }, (_, i) => ({
          weekLabel: `${monthShort} Week ${i + 1}`,
          totalQuestions: 0,
          totalCorrect: 0,
          totalWrong: 0,
          totalUnanswered: 0,
          accuracy: 0,
        }));
        monthMap.set(monthLabel, weeks);
      }
      
      if (!subjectMonthMap.has(monthLabel)) {
        subjectMonthMap.set(monthLabel, new Map());
      }

      const monthWeeks = monthMap.get(monthLabel);
      const subjectWeeks = subjectMonthMap.get(monthLabel);
      
      // Create date ranges for each week
      const weeksInMonth = monthWeeks.map((week, index) => {
        const weekStart = new Date(monthStart);
        weekStart.setDate(weekStart.getDate() + (index * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return { 
          ...week,
          weekStart,
          weekEnd 
        };
      });

      // Find which week this test belongs to
      const testWeek = weeksInMonth.find(({ weekStart, weekEnd }) => 
        testDate >= weekStart && testDate <= weekEnd
      );
      
      if (!testWeek) return;

      // Update overall metrics
      const weekData = monthWeeks.find(w => w.weekLabel === testWeek.weekLabel);
      if (weekData) {
        const totalQuestions = test.totalQuestions || (test.answered + test.unanswered) || 0;
        const correct = test.correct || 0;
        
        weekData.totalQuestions += totalQuestions;
        weekData.totalCorrect += correct;
        weekData.totalWrong += test.wrong || 0;
        weekData.totalUnanswered += test.unanswered || 0;
        weekData.accuracy = weekData.totalQuestions > 0
          ? Math.min(Math.round((weekData.totalCorrect / weekData.totalQuestions) * 100), 100)
          : 0;
      }

      // Update subject metrics if available - PARSE THE JSON HERE
      const resultsBySubject = safeParse(test.resultsBySubject);
      if (resultsBySubject && Object.keys(resultsBySubject).length > 0) {
        if (!subjectWeeks.has(testWeek.weekLabel)) {
          subjectWeeks.set(testWeek.weekLabel, {});
        }

        const weekSubjectData = subjectWeeks.get(testWeek.weekLabel);
        
        Object.values(resultsBySubject).forEach((subjectData) => {
          if (!subjectData) return;
          
          const subjectName = subjectData.subjectName || subjectData.name || "Unknown";
          const totalSubjectQuestions = (subjectData.attempted || 0) + (subjectData.unanswered || 0);
          const correct = subjectData.correct || 0;
          
          if (!weekSubjectData[subjectName]) {
            weekSubjectData[subjectName] = {
              totalQuestions: 0,
              correct: 0,
              wrong: 0,
              accuracy: 0,
            };
          }

          weekSubjectData[subjectName].totalQuestions += totalSubjectQuestions;
          weekSubjectData[subjectName].correct += correct;
          weekSubjectData[subjectName].wrong += subjectData.wrong || 0;
          
          weekSubjectData[subjectName].accuracy = 
            weekSubjectData[subjectName].totalQuestions > 0
              ? Math.min(Math.round((weekSubjectData[subjectName].correct / 
                  weekSubjectData[subjectName].totalQuestions) * 100), 100)
              : 0;
        });
      }
    } catch (error) {
      console.error("Error processing test result:", error);
    }
  });

  // Rest of your processing logic remains the same...
  // Process subject data
  const subjectWeeklyResults = new Map();
  subjectMonthMap.forEach((weekData, monthLabel) => {
    const subjectData = {};
    const allSubjects = new Set();

    // Collect all subjects
    weekData.forEach((subjects) => {
      Object.keys(subjects).forEach(subject => {
        if (subjects[subject]?.totalQuestions > 0) {
          allSubjects.add(subject);
        }
      });
    });

    // Initialize subject data structure
    Array.from(allSubjects).forEach(subject => {
      subjectData[subject] = [];
    });

    // Sort weeks in order
    const weekLabels = Array.from(weekData.keys())
      .filter(label => /Week [1-4]$/.test(label))
      .sort((a, b) => {
        const weekNumA = parseInt(a.match(/Week (\d+)/)[1], 10);
        const weekNumB = parseInt(b.match(/Week (\d+)/)[1], 10);
        return weekNumA - weekNumB;
      });

    // Populate subject data
    weekLabels.slice(0, 4).forEach(weekLabel => {
      const weekSubjects = weekData.get(weekLabel) || {};
      
      Array.from(allSubjects).forEach(subject => {
        const metrics = weekSubjects[subject] || {
          totalQuestions: 0,
          correct: 0,
          wrong: 0,
          accuracy: 0
        };

        subjectData[subject].push({
          weekLabel,
          accuracy: Number(metrics.accuracy) || 0,
          correct: metrics.correct || 0,
          wrong: metrics.wrong || 0,
          totalQuestions: metrics.totalQuestions || 0,
        });
      });
    });
    
    subjectWeeklyResults.set(monthLabel, subjectData);
  });

  return { weeklyResults: monthMap, subjectWeeklyResults };
}, [results]);

  // Get unique subjects for the legend
  const getUniqueSubjects = (monthLabel) => {
    const subjectData = subjectWeeklyResults.get(monthLabel);
    if (!subjectData) return [];
    
    return Object.keys(subjectData).filter(subject => {
      const subjectWeeks = subjectData[subject];
      return subjectWeeks.some(week => week.totalQuestions > 0);
    });
  };

  // Chart gradient definitions
  const barGradients = (
    <defs>
      <linearGradient id="correctGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.8}/>
      </linearGradient>
      <linearGradient id="wrongGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#EF5350" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#C62828" stopOpacity={0.8}/>
      </linearGradient>
      <linearGradient id="unansweredGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#78909C" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#455A64" stopOpacity={0.8}/>
      </linearGradient>
    </defs>
  );

  return (
    <div className="bg-white pt-6">
      <h2 className="text-3xl font-bold text-center text-[#35095efc] mb-8">
        Monthly Performance Analysis
      </h2>

      {Array.from(weeklyResults.entries()).map(([monthLabel, data], index) => {
        const subjects = getUniqueSubjects(monthLabel);
        const hasSubjectData = subjects.length > 0;
        
        // Calculate average accuracy with fallback for empty data
        const validWeeks = data.filter(week => week.totalQuestions > 0);
        const avgAccuracy = validWeeks.length > 0 
          ? validWeeks.reduce((sum, week) => sum + week.accuracy, 0) / validWeeks.length
          : 0;
        
        // Sort data by week number
        const sortedData = [...data].sort((a, b) => {
          const weekNumA = parseInt(a.weekLabel.match(/Week (\d+)/)[1], 10);
          const weekNumB = parseInt(b.weekLabel.match(/Week (\d+)/)[1], 10);
          return weekNumA - weekNumB;
        });
        
        // Prepare data with subject accuracies
        const dataWithSubjectAccuracies = sortedData.map(week => {
          const weekWithSubjects = { ...week };
          if (hasSubjectData) {
            subjects.forEach(subject => {
              const subjectData = subjectWeeklyResults.get(monthLabel)?.[subject] || [];
              const subjectWeek = subjectData.find(d => d.weekLabel === week.weekLabel);
              weekWithSubjects[`${subject} Accuracy`] = subjectWeek?.accuracy || 0;
            });
          }
          return weekWithSubjects;
        });

        return (
          <div 
            key={`month-${index}`} 
            className="p-6 bg-gray-50 rounded-xl border border-gray-200 mb-8"
            aria-labelledby={`month-heading-${index}`}
          >
            <h3 
              id={`month-heading-${index}`}
              className="text-2xl font-semibold text-gray-800 text-center mb-6 pb-2 border-b border-gray-200"
            >
              {monthLabel}
              <span className="block text-lg font-medium text-gray-500 mt-1">
                Average Accuracy: {avgAccuracy.toFixed(1)}%
              </span>
            </h3>
            
            {/* Overall Performance Bar Chart */}
            <div className="mb-10" aria-label="Weekly performance chart">
              <h4 className="text-xl font-semibold text-gray-700 text-center mb-4">
                Weekly Performance
              </h4>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={sortedData} 
                    margin={CHART_MARGIN}
                    aria-label={`Weekly performance for ${monthLabel}`}
                  >
                    {barGradients}
                    <CartesianGrid {...GRID_STYLE} />
                    <XAxis 
                      dataKey="weekLabel" 
                      tick={AXIS_STYLE} 
                      tickMargin={10}
                      axisLine={{ stroke: "#ccc" }}
                    />
                    <YAxis 
                      tick={AXIS_STYLE}
                      axisLine={{ stroke: "#ccc" }}
                      tickLine={{ stroke: "#ccc" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                    <Bar 
                      dataKey="totalCorrect" 
                      stackId="a" 
                      fill="url(#correctGradient)" 
                      name="Correct" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="totalWrong" 
                      stackId="a" 
                      fill="url(#wrongGradient)" 
                      name="Wrong" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="totalUnanswered" 
                      stackId="a" 
                      fill="url(#unansweredGradient)" 
                      name="Unanswered" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Accuracy Charts */}
            <div className="grid grid-cols-1 gap-8">
              {/* Overall Accuracy */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-xl font-semibold text-gray-700 text-center mb-4">
                  Weekly Accuracy Trend
                </h4>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart 
                    data={sortedData} 
                    margin={CHART_MARGIN}
                    aria-label={`Accuracy trend for ${monthLabel}`}
                  >
                    <CartesianGrid {...GRID_STYLE} />
                    <XAxis 
                      dataKey="weekLabel" 
                      tick={AXIS_STYLE} 
                      tickMargin={10}
                      axisLine={{ stroke: "#ccc" }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tickFormatter={(value) => `${value}%`} 
                      tick={AXIS_STYLE}
                      axisLine={{ stroke: "#ccc" }}
                      tickLine={{ stroke: "#ccc" }}
                    />
                    <ReferenceLine 
                      y={avgAccuracy} 
                      stroke="#FF9800" 
                      strokeDasharray="3 3"
                    >
                      <Label 
                        value={`Avg: ${avgAccuracy.toFixed(1)}%`} 
                        position="right" 
                        fill="#FF9800" 
                        fontSize={12}
                      />
                    </ReferenceLine>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      name="Overall Accuracy" 
                      stroke="#FF9800"
                      strokeWidth={3}
                      dot={{ 
                        r: 6, 
                        stroke: "#FF9800", 
                        strokeWidth: 2, 
                        fill: "#fff" 
                      }}
                      activeDot={{ 
                        r: 8, 
                        stroke: "#FF9800", 
                        strokeWidth: 2, 
                        fill: "#fff" 
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Subject-wise Accuracy */}
              {hasSubjectData && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="text-xl font-semibold text-gray-700 text-center mb-4">
                    Subject-wise Accuracy Comparison
                  </h4>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart 
                      data={dataWithSubjectAccuracies} 
                      margin={CHART_MARGIN}
                      aria-label={`Subject accuracy comparison for ${monthLabel}`}
                    >
                      <CartesianGrid {...GRID_STYLE} />
                      <XAxis 
                        dataKey="weekLabel" 
                        tick={AXIS_STYLE} 
                        tickMargin={10}
                        axisLine={{ stroke: "#ccc" }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tickFormatter={(value) => `${value}%`} 
                        tick={AXIS_STYLE}
                        axisLine={{ stroke: "#ccc" }}
                        tickLine={{ stroke: "#ccc" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend content={<CustomLegend />} />
                      {subjects.map((subject) => {
                        const color = getSubjectColor(subject);
                        return (
                          <Line
                            key={subject}
                            type="monotone"
                            dataKey={`${subject} Accuracy`}
                            name={`${subject} `}
                            stroke={color}
                            strokeWidth={2}
                            dot={{ 
                              r: 4,
                              stroke: color,
                              strokeWidth: 1,
                              fill: "#fff"
                            }}
                            activeDot={{ 
                              r: 6,
                              stroke: color,
                              strokeWidth: 2,
                              fill: "#fff"
                            }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}