"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchResultByUser } from "@/utils/api";
import { format, startOfWeek, endOfWeek } from "date-fns";
import ResultsByMonth from "@/components/ResultsByMonth";
import ChartResultsByWeek from "@/components/ChartByMonth";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function ResultPage() {
  const [weeklyResults, setWeeklyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [userId, setUserId] = useState(null);

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          slidesToShow: 1.2,
        }
      }
    ]
  };

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    } else {
      setError("User ID not found. Please log in again.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!userId) {
          return; // Don't proceed if userId is not available
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
        setError("You not attent any test yet. please attent test.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [userId]); // Add userId as dependency

  // Rest of your component remains the same...
  if (loading) return <div className="container pt-6">Loading results...</div>;
  if (error) return <div className="container pt-6 text-black text-center">{error}</div>;
  if (weeklyResults.length === 0) return <div className="container pt-6">No results available.</div>;

  return (
    <div className="">
         <div className="mt-12">
        <ChartResultsByWeek results={results} />
      </div>
      <div className="mx-auto">
        <Slider {...sliderSettings}>
          {weeklyResults.map(({ weekLabel, totalScore, totalMarks, totalAnswered, totalCorrect, totalWrong, totalUnanswered }, index) => (
            <div key={index} className="px-2 outline-none ">
              <div className="bg-white p-6 rounded-lg mb-4 border border-gray-200 transition-shadow duration-300 ">
                <h2 className="text-2xl font-extrabold mb-4 text-[#35095e]">{weekLabel}</h2>
                <div className="grid gap-3">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold w-[60%]">Answered</p>
                    <p className="text-lg w-[40%]">{totalAnswered} Qus</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold w-[60%]">Correct</p>
                    <p className="text-lg w-[40%] flex items-center gap-2"><img className="w-5 h-5 ml-[-25px]" src="/images/menuicon/up.png" alt="up icon" />{totalCorrect} Ans</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold w-[60%] ">Wrong</p>
                    <p className="text-lg w-[40%] flex items-center gap-2"><img className="w-5 h-5 ml-[-25px]" src="/images/menuicon/down.png" alt="down icon" />{totalWrong} Ans</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold w-[60%]">Unanswered </p>
                    <p className="text-lg w-[40%]">{totalUnanswered} Ans</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold w-[60%]">Total Score</p>
                    <p className="text-lg w-[40%]">{totalScore} </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold w-[60%]">Accuracy</p>
                    <p className="text-lg w-[40%]">{totalAnswered > 0 ? ((totalCorrect / totalAnswered) * 100).toFixed(2) : 0}%</p>
                  </div>
                 
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
  <div className="mt-12">
        <ResultsByMonth results={results} />
      </div>
   
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

  return Array.from(weeksMap.entries())
    .map(([weekLabel, data]) => ({ weekLabel, ...data }))
    .sort((a, b) => new Date(b.weekLabel.split(" - ")[0]) - new Date(a.weekLabel.split(" - ")[0]));
};