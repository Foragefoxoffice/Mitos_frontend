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
} from "recharts";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachWeekOfInterval } from "date-fns";

export default function chartResultsByWeek({ results }) {
  // 📌 Group test results by month and divide by weeks
  const weeklyResults = useMemo(() => {
    const monthMap = new Map();

    results.forEach((test) => {
      if (!test.createdAt) return;

      const testDate = new Date(test.createdAt);
      const monthStart = startOfMonth(testDate);
      const monthLabel = format(monthStart, "MMMM yyyy"); // Example: "February 2025"
      const monthShort = format(monthStart, "MMM"); // Example: "Feb"

      if (!monthMap.has(monthLabel)) {
        monthMap.set(monthLabel, []);
      }

      const monthWeeks = monthMap.get(monthLabel);
      const weeks = eachWeekOfInterval(
        { start: monthStart, end: endOfMonth(testDate) },
        { weekStartsOn: 1 }
      );

      weeks.forEach((weekStart, index) => {
        const weekNumber = index + 1;
        const weekSuffix = ["th", "st", "nd", "rd"][
          (weekNumber % 10 < 4 && (weekNumber % 100 - weekNumber % 10) !== 10) ? weekNumber % 10 : 0
        ];
        const weekLabel = `${monthShort} ${weekNumber}${weekSuffix} Week`;

        let weekData = monthWeeks.find((w) => w.weekLabel === weekLabel);
        if (!weekData) {
          weekData = {
            weekLabel,
            totalAttempted: 0,
            totalCorrect: 0,
            totalWrong: 0,
            totalUnanswered: 0,
            accuracy: 0,
          };
          monthWeeks.push(weekData);
        }

        if (testDate >= weekStart && testDate <= endOfWeek(weekStart, { weekStartsOn: 1 })) {
          weekData.totalAttempted += test.answered;
          weekData.totalCorrect += test.correct;
          weekData.totalWrong += test.wrong;
          weekData.totalUnanswered += test.unanswered;

          weekData.accuracy =
            weekData.totalAttempted > 0
              ? ((weekData.totalCorrect / weekData.totalAttempted) * 100).toFixed(2)
              : 0;
        }
      });
    });

    return monthMap;
  }, [results]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Claims Over the Month</h2>

      {Array.from(weeklyResults.entries()).map(([monthLabel, data], index) => (
        <div key={index} className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 text-center mb-4">{monthLabel}</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="weekLabel" tick={{ fontSize: 14, fill: "#333", fontWeight: "bold" }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalAttempted" stackId="a" fill="#007bff" name="Attempted" />
              <Bar dataKey="totalCorrect" stackId="a" fill="#28a745" name="Correct" />
              <Bar dataKey="totalWrong" stackId="a" fill="#dc3545" name="Wrong" />
              <Bar dataKey="totalUnanswered" stackId="a" fill="#6c757d" name="Left Qus" />
            </BarChart>
          </ResponsiveContainer>

          {/* Accuracy Line Chart */}
          <h4 className="text-lg font-semibold text-gray-700 text-center mt-6">Accuracy Over Weeks</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="weekLabel" tick={{ fontSize: 14, fill: "#333", fontWeight: "bold" }} />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#ff9800" name="Accuracy (%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
