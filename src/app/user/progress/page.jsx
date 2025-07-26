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
import CommonLoader from "@/commonLoader";

// Custom Arrows
const NextArrow = ({ onClick }) => (
  <div
    className="absolute right-[-15px] top-1/2 z-10 transform -translate-y-1/2 cursor-pointer"
    onClick={onClick}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-[#35095e]">
      <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div
    className="absolute left-[-15px] top-1/2 z-10 transform -translate-y-1/2 cursor-pointer"
    onClick={onClick}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-[#35095e]">
      <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export default function ResultPage() {
  const [weeklyResults, setWeeklyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [userId, setUserId] = useState(null);

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2.2,
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1.2,
          arrows: false,
        },
      },
    ],
  };

  useEffect(() => {
    const storedUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
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
        if (!userId) return;

        const response = await fetchResultByUser(userId);
        if (!response || !response.data) throw new Error("No data received");

        const groupedResults = groupResultsByWeek(response.data);
        setWeeklyResults(groupedResults);
        setResults(response.data);
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setError("You have not attempted any test yet.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [userId]);

  if (loading) return <div className="container pt-6"><CommonLoader /></div>;
  
if (weeklyResults.length === 0) {
  return (
    <div className="relative w-full h-[400px] overflow-hidden">

      <img
        src="/images/progress.png"
        alt="No Results"
        className="absolute inset-0 w-full h-full object-cover filter blur-sm opacity-70"
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold text-gray-800">No results available</h2>
        <p className="text-md text-gray-600 mt-2">Please take the test to see your results.</p>
           <a
          href="/user/dashboard"
          className="mt-6 px-6 py-2 bg-[#35095e] text-white font-medium rounded-lg hover:bg-[#35095e]/80 transition"
        >
          Take the Test
        </a>
      </div>
    </div>
  );
}



  return (
    <div className="container px-2 mx-auto">
      <div className="mt-12">
        <ChartResultsByWeek results={results} />
      </div>

      <div className="relative my-12">
        <Slider {...sliderSettings}>
          {weeklyResults.map((week, index) => (
            <div key={index} className="px-2 outline-none">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow transition duration-300">
                <h2 className="text-2xl font-extrabold mb-4 text-[#35095e]">{week.weekLabel}</h2>
                <div className="grid gap-3 text-sm">
                  <StatRow label="Answered" value={`${week.totalAnswered} Qus`} />
                  <StatRow label="Correct" value={`${week.totalCorrect} Ans`} icon="/images/menuicon/up.png" />
                  <StatRow label="Wrong" value={`${week.totalWrong} Ans`} icon="/images/menuicon/down.png" />
                  <StatRow label="Unanswered" value={`${week.totalUnanswered} Ans`} />
                  <StatRow label="Total Score" value={week.totalScore} />
                  <StatRow
                    label="Accuracy"
                    value={
                      week.totalAnswered > 0
                        ? `${((week.totalCorrect / week.totalAnswered) * 100).toFixed(2)}%`
                        : "0%"
                    }
                  />
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

const StatRow = ({ label, value, icon }) => (
  <div className="flex justify-between items-center">
    <p className="font-semibold w-[60%]">{label}</p>
    <p className="text-lg w-[40%] flex items-center gap-2">
      {icon && <img className="w-5 h-5 ml-[-20px]" src={icon} alt={`${label} icon`} />}
      {value}
    </p>
  </div>
);

const groupResultsByWeek = (results) => {
  const weeksMap = new Map();

  results.forEach((test) => {
    if (!test.createdAt) return;

    const testDate = new Date(test.createdAt);
    const weekStart = startOfWeek(testDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(testDate, { weekStartsOn: 1 });
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

    const data = weeksMap.get(weekLabel);
    data.totalScore += test.score;
    data.totalMarks += test.totalMarks;
    data.totalAnswered += test.answered;
    data.totalCorrect += test.correct;
    data.totalWrong += test.wrong;
    data.totalUnanswered += test.unanswered;
  });

  return Array.from(weeksMap.entries())
    .map(([weekLabel, data]) => ({ weekLabel, ...data }))
    .sort((a, b) => new Date(b.weekLabel.split(" - ")[0]) - new Date(a.weekLabel.split(" - ")[0]));
};
