"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchResultByUser } from "@/utils/api";
import { format, startOfWeek, endOfWeek } from "date-fns";
import ResultsByMonth from "@/components/ResultsByMonth";
import ChartResultsByWeek from "@/components/ChartByMonth";

export default function ResultPage() {
  const [weeklyResults, setWeeklyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setError("User ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await fetchResultByUser(userId);
        if (!response || !response.data) {
          throw new Error("No data received");
        }

        const groupedResults = groupResultsByWeek(response.data);
        setWeeklyResults(groupedResults);
        setResults(response.data);
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setError("Unable to load results. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) return <div className="container pt-6">Loading results...</div>;
  if (error) return <div className="container pt-6 text-red-500">{error}</div>;
  if (weeklyResults.length === 0) return <div className="container pt-6">No results available.</div>;

  return (
    <div className="container pt-6">
      <h1 className="text-2xl font-bold mb-4">Your Weekly Test Results</h1>

      {weeklyResults.map(({ weekLabel, totalScore, totalMarks, totalAnswered, totalCorrect, totalWrong, totalUnanswered }, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-lg mb-4">
          <h2 className="text-xl font-bold mb-4">{weekLabel}</h2>
          <p className="mb-2"><span className="font-bold">Total Score:</span> {totalScore} / {totalMarks}</p>
          <p className="mb-2"><span className="font-bold">Answered:</span> {totalAnswered}</p>
          <p className="mb-2"><span className="font-bold">Correct Answers:</span> {totalCorrect}</p>
          <p className="mb-2"><span className="font-bold">Wrong Answers:</span> {totalWrong}</p>
          <p className="mb-2"><span className="font-bold">Unanswered:</span> {totalUnanswered}</p>
          <p className="mb-4"><span className="font-bold">Accuracy:</span> {totalAnswered > 0 ? ((totalCorrect / totalAnswered) * 100).toFixed(2) : 0}%</p>
        </div>
      ))}
       <ResultsByMonth results={results} />
<ChartResultsByWeek results={results} />
      <button
        onClick={() => router.push("/user/practice")}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mt-6"
      >
        Go Back to Practice
      </button>
    </div>
  );
}

/** 🛠 Group test results by week (Monday to Sunday) */
const groupResultsByWeek = (results) => {
  const weeksMap = new Map();

  results.forEach((test) => {
    if (!test.createdAt) return;

    const testDate = new Date(test.createdAt);
    const weekStart = startOfWeek(testDate, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(testDate, { weekStartsOn: 1 }); // Sunday end
    const weekLabel = `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`;

    if (!weeksMap.has(weekLabel)) {
      weeksMap.set(weekLabel, {
        totalScore: 0,
        totalMarks: 0,
        totalAnswered: 0,
        totalCorrect: 0,
        totalWrong: 0,
        totalUnanswered: 0,
      });
    }

    const weekData = weeksMap.get(weekLabel);
    weekData.totalScore += test.score;
    weekData.totalMarks += test.totalMarks;
    weekData.totalAnswered += test.answered;
    weekData.totalCorrect += test.correct;
    weekData.totalWrong += test.wrong;
    weekData.totalUnanswered += test.unanswered;
  });

  // Convert Map to array and sort weeks in DESC order (latest first)
  return Array.from(weeksMap.entries())
    .map(([weekLabel, data]) => ({ weekLabel, ...data }))
    .sort((a, b) => new Date(b.weekLabel.split(" - ")[0]) - new Date(a.weekLabel.split(" - ")[0]));
};
