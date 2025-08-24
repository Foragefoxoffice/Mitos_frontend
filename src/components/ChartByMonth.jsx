"use client";
import React, { useMemo, useState } from "react";
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
  Label,
} from "recharts";
import {
  format,
  startOfMonth,
  parseISO,
  isWithinInterval,
  endOfMonth,
  getDaysInMonth,
} from "date-fns";
import { FiChevronDown, FiChevronUp, FiCalendar } from "react-icons/fi";
import { FcCalendar } from "react-icons/fc";

// Constants for reusable styles and configurations
const CHART_MARGIN = { top: 20, right: 30, left: 20, bottom: 60 };
const AXIS_STYLE = {
  fontSize: 12,
  fill: "#555",
  fontWeight: "500",
};
const GRID_STYLE = {
  strokeDasharray: "3 3",
  vertical: false,
  stroke: "#e0e0e0",
};

// Animation configurations
const ANIMATION_PROPS = {
  isAnimationActive: true,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: "ease-out",
};

const BAR_ANIMATION = {
  ...ANIMATION_PROPS,
  animationDuration: 1000,
};

const LINE_ANIMATION = {
  ...ANIMATION_PROPS,
  animationDuration: 2000,
};

// Color mappings for consistency
const COLOR_MAP = {
  Correct: "#4CAF50",
  Wrong: "#EF5350",
  Unanswered: "#78909C",
  "Overall Accuracy": "#FF9800",
  Accuracy: "#4E79A7", // Base color for subject accuracies (overridden by specific colors)
  "Total Questions": "#35095e",
};
const BAR_ORDER = [ "Correct", "Wrong","Unanswered"];
const SUBJECT_COLORS = [
  "#e6194B",
  "#3cb44b",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#42d4f4",
  "#f032e6",
  "#bfef45",
  "#ffd700",
  "#000000",
  "#a9a9a9",
  "#800000",
  "#469990",
  "#000075",
  "#9A6324",
  "#800080",
  "#808000",
  "#008080",
  "#e6beff",
  "#ffe119",
];

const subjectColorMap = new Map();

const getSubjectColor = (subjectName) => {
  if (!subjectColorMap.has(subjectName)) {
    const color = SUBJECT_COLORS[subjectColorMap.size % SUBJECT_COLORS.length];
    subjectColorMap.set(subjectName, color);
  }
  return subjectColorMap.get(subjectName);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  // Find the total questions data point if available
  const totalQuestionsEntry = payload.find(
    (entry) => entry.dataKey === "totalQuestions"
  );
  const totalQuestions = totalQuestionsEntry?.value || 0;

  return (
    <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
      <p className="font-bold text-gray-800 mb-2">{label}</p>

      {/* Display total questions attempted if available */}
      {totalQuestions > 0 && (
        <div className="mb-3 pb-2 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2 bg-[#35095e]" />
            <span className="text-gray-600 font-medium">Total Questions:</span>
            <span className="ml-1 font-semibold">{totalQuestions}</span>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {payload
          .filter(
            (entry) =>
              entry.value !== undefined &&
              entry.dataKey !== "totalQuestions" && // Exclude total
              !entry.name.includes("Accuracy") // Exclude accuracy here
          )
          // ✅ enforce order: Correct → Wrong → Unanswered
          .sort((a, b) => {
            const ia = BAR_ORDER.indexOf(a.name);
            const ib = BAR_ORDER.indexOf(b.name);
            return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
          })
          .map((entry, index) => {
            let color = COLOR_MAP[entry.name] || entry.color || "#888";
            let displayName = entry.name;

            if (
              entry.name.endsWith(" Accuracy") &&
              entry.name !== "Overall Accuracy"
            ) {
              const subject = entry.name.replace(" Accuracy", "");
              color = getSubjectColor(subject);
              displayName = subject;
            }

            return (
              <div key={`tooltip-item-${index}`} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-600 font-medium">
                  {displayName}:
                </span>
                <span className="ml-1 font-semibold">{entry.value}</span>
              </div>
            );
          })}
      </div>

      {/* Display accuracy entries separately */}
      {payload.some((entry) => entry.name.includes("Accuracy")) && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Accuracy Metrics:
          </p>
          {payload
            .filter((entry) => entry.name.includes("Accuracy"))
            .map((entry, index) => {
              let color;
              let displayName = entry.name;

              if (
                entry.name.endsWith(" Accuracy") &&
                entry.name !== "Overall Accuracy"
              ) {
                const subject = entry.name.replace(" Accuracy", "");
                color = getSubjectColor(subject);
                displayName = subject;
              } else {
                color = COLOR_MAP[entry.name] || entry.color || "#888";
              }

              return (
                <div
                  key={`accuracy-item-${index}`}
                  className="flex items-center"
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-gray-600 font-medium">
                    {displayName}:
                  </span>
                  <span className="ml-1 font-semibold">{entry.value}%</span>
                </div>
              );
            })}
        </div>
      )}
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
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

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

  const safeParse = (str) => {
    try {
      return str ? JSON.parse(str) : {};
    } catch (error) {
      console.error("Failed to parse JSON:", error);
      return {};
    }
  };

  const { monthlyResults, subjectMonthlyResults, availableMonths } =
    useMemo(() => {
      const monthMap = new Map();
      const subjectMonthMap = new Map();
      const monthsSet = new Set();

      results.forEach((test) => {
        if (!test?.createdAt) return;

        try {
          const testDate = parseISO(test.createdAt);
          const monthStart = startOfMonth(testDate);
          const monthEnd = endOfMonth(testDate);
          const monthLabel = format(monthStart, "MMMM yyyy");
          const monthKey = format(monthStart, "yyyy-MM");
          const monthShort = format(monthStart, "MMM");
          const daysInMonth = getDaysInMonth(monthStart);

          monthsSet.add(monthKey);

          // Initialize month data if not exists
          if (!monthMap.has(monthKey)) {
            // Create weeks that cover all days of the month
            const weeks = [];
            let currentWeekStart = 1;
            let weekNumber = 1;

            while (currentWeekStart <= daysInMonth) {
              const weekEnd = Math.min(currentWeekStart + 6, daysInMonth);
              const weekLabel = `${monthShort} ${currentWeekStart}-${weekEnd}`;

              weeks.push({
                weekLabel,
                weekNumber,
                startDay: currentWeekStart,
                endDay: weekEnd,
                totalQuestions: 0,
                totalCorrect: 0,
                totalWrong: 0,
                totalAttempted: 0,
                totalUnanswered: 0,
                accuracy: 0,
              });

              currentWeekStart = weekEnd + 1;
              weekNumber++;
            }

            monthMap.set(monthKey, {
              label: monthLabel,
              weeks: weeks,
            });
          }

          if (!subjectMonthMap.has(monthKey)) {
            subjectMonthMap.set(monthKey, new Map());
          }

          const monthData = monthMap.get(monthKey);
          const subjectWeeks = subjectMonthMap.get(monthKey);

          // Create date ranges for each week
          const weeksInMonth = monthData.weeks.map((week) => {
            const weekStart = new Date(monthStart);
            weekStart.setDate(week.startDay);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(week.endDay);
            return {
              ...week,
              weekStart,
              weekEnd,
            };
          });

          // Find which week this test belongs to
          const testWeek = weeksInMonth.find(({ weekStart, weekEnd }) =>
            isWithinInterval(testDate, { start: weekStart, end: weekEnd })
          );

          if (!testWeek) return;

          // Update overall metrics
          const weekData = monthData.weeks.find(
            (w) => w.weekLabel === testWeek.weekLabel
          );
          if (weekData) {
            const totalQuestions =
              test.totalQuestions || test.answered + test.unanswered || 0;
            const correct = test.correct || 0;
            const wrong = test.wrong || 0;
            const attempted = correct + wrong;

            weekData.totalQuestions += totalQuestions;
            weekData.totalCorrect += correct;
            weekData.totalWrong += wrong;
            weekData.totalAttempted += attempted;
            weekData.totalUnanswered += test.unanswered || 0;
            // Update accuracy using the formula: (Correct / Total Questions) × 100
            weekData.accuracy =
              weekData.totalAttempted > 0
                ? Math.min(
                    Math.round(
                      (weekData.totalCorrect / weekData.totalAttempted) * 100
                    ),
                    100
                  )
                : 0;
          }

          // Update subject metrics if available
          const resultsBySubject = safeParse(test.resultsBySubject);
          if (resultsBySubject && Object.keys(resultsBySubject).length > 0) {
            if (!subjectWeeks.has(testWeek.weekLabel)) {
              subjectWeeks.set(testWeek.weekLabel, {});
            }

            const weekSubjectData = subjectWeeks.get(testWeek.weekLabel);

            Object.values(resultsBySubject).forEach((subjectData) => {
              if (!subjectData) return;

              const subjectName =
                subjectData.subjectName || subjectData.name || "Unknown";
              const totalSubjectQuestions =
                (subjectData.attempted || 0) + (subjectData.unanswered || 0);
              const correct = subjectData.correct || 0;
              const wrong = subjectData.wrong || 0;
              const attempted = correct + wrong;

              if (!weekSubjectData[subjectName]) {
                weekSubjectData[subjectName] = {
                  totalQuestions: 0,
                  correct: 0,
                  wrong: 0,
                  attempted: 0,
                  accuracy: 0,
                };
              }

              weekSubjectData[subjectName].totalQuestions +=
                totalSubjectQuestions;
              weekSubjectData[subjectName].correct += correct;
              weekSubjectData[subjectName].wrong += wrong;
              weekSubjectData[subjectName].attempted += attempted;

              // Update subject accuracy using the formula: (Correct / Total Questions) × 100
              weekSubjectData[subjectName].accuracy =
                weekSubjectData[subjectName].attempted > 0
                  ? Math.min(
                      Math.round(
                        (weekSubjectData[subjectName].correct /
                          weekSubjectData[subjectName].attempted) *
                          100
                      ),
                      100
                    )
                  : 0;
            });
          }
        } catch (error) {
          console.error("Error processing test result:", error);
        }
      });

      // Process subject data
      const subjectMonthlyResults = new Map();
      subjectMonthMap.forEach((weekData, monthKey) => {
        const subjectData = {};
        const allSubjects = new Set();

        // Collect all subjects
        weekData.forEach((subjects) => {
          Object.keys(subjects).forEach((subject) => {
            if (subjects[subject]?.totalQuestions > 0) {
              allSubjects.add(subject);
            }
          });
        });

        // Initialize subject data structure
        Array.from(allSubjects).forEach((subject) => {
          subjectData[subject] = [];
        });

        // Sort weeks in order
        const weekLabels = Array.from(weekData.keys()).sort((a, b) => {
          // Extract the start day from the label (e.g., "Jan 1-7" => 1)
          const startDayA = parseInt(a.split(" ")[1].split("-")[0], 10);
          const startDayB = parseInt(b.split(" ")[1].split("-")[0], 10);
          return startDayA - startDayB;
        });

        // Populate subject data
        weekLabels.forEach((weekLabel) => {
          const weekSubjects = weekData.get(weekLabel) || {};

          Array.from(allSubjects).forEach((subject) => {
            const metrics = weekSubjects[subject] || {
              totalQuestions: 0,
              correct: 0,
              wrong: 0,
              attempted: 0,
              accuracy: 0,
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

        subjectMonthlyResults.set(monthKey, subjectData);
      });

      // Sort available months in descending order (newest first)
      const sortedMonths = Array.from(monthsSet).sort((a, b) => {
        return new Date(b) - new Date(a);
      });

      return {
        monthlyResults: monthMap,
        subjectMonthlyResults,
        availableMonths: sortedMonths,
      };
    }, [results]);

  const getUniqueSubjects = (monthKey) => {
    const subjectData = subjectMonthlyResults.get(monthKey);
    if (!subjectData) return [];

    return Object.keys(subjectData).filter((subject) => {
      const subjectWeeks = subjectData[subject];
      return subjectWeeks.some((week) => week.totalQuestions > 0);
    });
  };

  // Enhanced month selector component
  const MonthSelector = () => {
    const currentDate = new Date(selectedMonth);
    const formattedCurrentMonth = format(currentDate, "MMMM yyyy");

    const monthsWithStats = availableMonths.map((monthKey) => {
      const monthStart = parseISO(`${monthKey}-01`);
      const monthEnd = endOfMonth(monthStart);

      // Filter results within this month
      const testsInMonth = results.filter((test) => {
        const testDate = parseISO(test.createdAt);
        return isWithinInterval(testDate, { start: monthStart, end: monthEnd });
      });

      const totalCorrect = testsInMonth.reduce(
        (sum, test) => sum + (test.correct || 0),
        0
      );
      const totalAttempted = testsInMonth.reduce((sum, test) => {
        const attempted =
          test.answered ?? (test.correct ?? 0) + (test.wrong ?? 0); // fallback if answered is missing
        return sum + attempted;
      }, 0);

      const avgAccuracy =
        totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

      return {
        key: monthKey,
        label: format(new Date(monthKey + "-01"), "MMMM yyyy"),
        accuracy: avgAccuracy,
        testCount: testsInMonth.length,
      };
    });

    return (
      <div className="flex justify-center md:justify-end mt-6 relative">
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
                {monthsWithStats.map((month) => (
                  <div
                    key={month.key}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 flex justify-between items-center ${
                      selectedMonth === month.key ? "bg-[#35095e10]" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMonth(month.key);
                      setIsMonthDropdownOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      <span
                        className={`font-medium ${
                          selectedMonth === month.key
                            ? "text-[#35095e]"
                            : "text-gray-700"
                        }`}
                      >
                        {month.label}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {month.testCount} test{month.testCount !== 1 ? "s" : ""}
                      </span>
                      <span
                        className={`text-sm font-medium  px-2 py-1 rounded-full ${
                          month.accuracy >= 70
                            ? "text-green-600 bg-green-100"
                            : month.accuracy >= 50
                            ? "text-yellow-600 bg-yellow-100"
                            : "text-red-600 bg-red-100"
                        }`}
                      >
                        accuracy {month.accuracy.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                Showing {monthsWithStats.length} month
                {monthsWithStats.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>

        {/* Click outside to close */}
        {isMonthDropdownOpen && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setIsMonthDropdownOpen(false)}
          />
        )}
      </div>
    );
  };

  // Get data for selected month
  const selectedMonthData = monthlyResults.get(selectedMonth);
  if (!selectedMonthData) {
    return (
      <div className="bg-white p-8 text-center rounded-xl">
        <p className="text-gray-500 text-lg">
          No data available for selected month.
        </p>
      </div>
    );
  }

  const { label: monthLabel, weeks: monthWeeks } = selectedMonthData;
  const subjects = getUniqueSubjects(selectedMonth);
  const hasSubjectData = subjects.length > 0;

  // Calculate average accuracy with the correct formula: (Correct / Total Questions) × 100
  const validWeeks = monthWeeks.filter((week) => week.totalQuestions > 0);
  const totalMonthCorrect = validWeeks.reduce(
    (sum, week) => sum + week.totalCorrect,
    0
  );
  const totalMonthAttempted = validWeeks.reduce(
    (sum, week) => sum + week.totalAttempted,
    0
  );
  const avgAccuracy =
    totalMonthAttempted > 0
      ? (totalMonthCorrect / totalMonthAttempted) * 100
      : 0;

  // Sort data by week number
  const sortedData = [...monthWeeks].sort(
    (a, b) => a.weekNumber - b.weekNumber
  );

  // Prepare data with subject accuracies
  const dataWithSubjectAccuracies = sortedData.map((week) => {
    const weekWithSubjects = { ...week };
    if (hasSubjectData) {
      subjects.forEach((subject) => {
        const subjectData =
          subjectMonthlyResults.get(selectedMonth)?.[subject] || [];
        const subjectWeek = subjectData.find(
          (d) => d.weekLabel === week.weekLabel
        );
        weekWithSubjects[`${subject} Accuracy`] = subjectWeek?.accuracy || 0;
      });
    }
    return weekWithSubjects;
  });

  // Chart gradient definitions
  const barGradients = (
    <defs>
      <linearGradient id="correctGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.8} />
      </linearGradient>
      <linearGradient id="wrongGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#EF5350" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#C62828" stopOpacity={0.8} />
      </linearGradient>
      <linearGradient id="unansweredGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#78909C" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#455A64" stopOpacity={0.8} />
      </linearGradient>
    </defs>
  );

  return (
    <div className="bg-[#F0F8FF] pt-6">
      <div className="bg-[#007ACC] py-2 md:py-6 px-3 rounded-2xl flex items-center justify-center md:gap-7 gap-2">
        <img
          className="w-[10%] md:w-[auto]"
          src="/images/practice/report.png"
          alt=""
        />
        <h2 className="text-lg md:text-3xl font-bold text-[#fff]">
          Monthly Performance Analysis
        </h2>
      </div>

      <MonthSelector />

      <div
        className="p-2 md:p-6 bg-[#F0F8FF] rounded-xl mb-8"
        aria-labelledby={`month-heading`}
      >
        <div className="bg-white text-center p-4 rounded-xl border border-[#007ACC40] mb-6">
          <h3
            id={`month-heading`}
            className="text-2xl flex justify-center items-center gap-3 font-semibold text-gray-800 text-center pb-2"
          >
            <FcCalendar /> {monthLabel}
          </h3>
          <span className="block text-lg font-medium text-gray-500">
            Average Accuracy: {avgAccuracy.toFixed(1)}%
          </span>
        </div>

        {/* Overall Performance Bar Chart */}
        <div
          className="mb-10 p-3 bg-white border border-[#007ACC40] rounded-xl"
          aria-label="Weekly performance chart"
        >
          <div className="bg-[#00A86B] py-2 md:py-6 rounded-lg mb-5">
            <h4 className="text-xl font-semibold text-white text-center">
              🏆 Weekly Performance
            </h4>
          </div>

          <div className="bg-white p-0 md:p-4 rounded-lg">
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
                  dataKey="totalQuestions"
                  name="Total Questions"
                  fill="transparent"
                  legendType="none"
                  isAnimationActive={false}
                />
               
                <Bar
                  dataKey="totalUnanswered"
                  stackId="a"
                  fill="url(#unansweredGradient)"
                  name="Unanswered"
                  radius={[4, 4, 0, 0]}
                  {...BAR_ANIMATION}
                />
                 
                <Bar
                  dataKey="totalWrong"
                  stackId="a"
                  fill="url(#wrongGradient)"
                  name="Wrong"
                  radius={[4, 4, 0, 0]}
                  {...BAR_ANIMATION}
                />
                <Bar
                  dataKey="totalCorrect"
                  stackId="a"
                  fill="url(#correctGradient)"
                  name="Correct"
                  radius={[4, 4, 0, 0]}
                  {...BAR_ANIMATION}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Charts */}
        <div className="grid grid-cols-1 gap-8">
          {/* Overall Accuracy */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="bg-[#BC41AA] py-2 md:py-6 rounded-lg mb-5">
              {" "}
              <h4 className="text-xl font-semibold text-white text-center">
                🎯 Weekly Accuracy Trend
              </h4>
            </div>

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
                    fill: "#fff",
                  }}
                  activeDot={{
                    r: 8,
                    stroke: "#FF9800",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                  {...LINE_ANIMATION}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subject-wise Accuracy */}
          {hasSubjectData && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="bg-[#5041BC] py-2 md:py-6 rounded-lg mb-5">
                <h4 className="text-xl font-semibold text-white text-center">
                  📊 Subject-wise Accuracy Comparison
                </h4>
              </div>

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
                        name={`${subject} Accuracy`}
                        stroke={color}
                        strokeWidth={2}
                        dot={{
                          r: 4,
                          stroke: color,
                          strokeWidth: 1,
                          fill: "#fff",
                        }}
                        activeDot={{
                          r: 6,
                          stroke: color,
                          strokeWidth: 2,
                          fill: "#fff",
                        }}
                        {...LINE_ANIMATION}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
