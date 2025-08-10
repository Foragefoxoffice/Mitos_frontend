"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchResultByUser } from "@/utils/api";
import { format } from "date-fns";
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
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="w-6 h-6 text-[#35095e]"
    >
      <path
        d="M9 18l6-6-6-6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div
    className="absolute left-[-15px] top-1/2 z-10 transform -translate-y-1/2 cursor-pointer"
    onClick={onClick}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="w-6 h-6 text-[#35095e]"
    >
      <path
        d="M15 18l-6-6 6-6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export default function ResultPage() {
  const [weeklyResults, setWeeklyResults] = useState([]);
  const [results, setResults] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const router = useRouter();

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

  // Get userId
  useEffect(() => {
    const storedUserId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    } else {
      setHasFetched(true);
      setLoading(false);
    }
  }, []);

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const response = await fetchResultByUser(userId);
        const data = response?.data || [];
        setResults(data);
        setWeeklyResults(groupResultsByWeek(data));
      } catch (err) {
        setResults([]);
        setWeeklyResults([]);
      } finally {
        setHasFetched(true);
        setLoading(false);
      }
    };
    fetchResults();
  }, [userId]);

  // Show loader until fetch finishes
  if (loading || !hasFetched) {
    return (
      <div className="container pt-6">
        <CommonLoader />
      </div>
    );
  }

  // Show empty state only after fetch is done
  if (weeklyResults.length === 0) {
    return (
      <div className="relative w-full h-[400px] overflow-hidden">
        <img
          src="/images/progress.png"
          alt="No Results"
          className="absolute inset-0 w-full h-full object-cover filter blur-sm opacity-70"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            No results available
          </h2>
          <p className="text-md text-gray-600 mt-2">
            Please take the test to see your results.
          </p>
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

  // Main UI
  return (
    <div className="container px-2 mx-auto">
      <div className="mt-2 md:mt-12">
        <ChartResultsByWeek results={results} />
      </div>

      <div className="mt-12">
        <ResultsByMonth results={results} />
      </div>

      <div className="relative my-12">
        <Slider {...sliderSettings}>
          {weeklyResults.map((week, index) => (
            <div key={index} className="px-2 outline-none">
              <div className="bg-white p-4 rounded-3xl border border-[#007ACC40] transition duration-300">
                <div className="bg-[#F7941D] py-3 mb-4 rounded-xl text-center">
                  <h2 className="text-xl font-extrabold text-[#fff]">
                    {week.weekLabel}
                  </h2>
                </div>

                <div className="grid gap-3 text-sm">
                  <StatRow
                    label="Answered"
                    value={`${week.totalAnswered} Qus`}
                  />
                  <StatRow
                    label="Correct"
                    value={`${week.totalCorrect} Ans`}
                    icon="/images/menuicon/up.png"
                  />
                  <StatRow
                    label="Wrong"
                    value={`${week.totalWrong} Ans`}
                    icon="/images/menuicon/down.png"
                  />
                  <StatRow
                    label="Unanswered"
                    value={`${week.totalUnanswered} Ans`}
                  />
                  <StatRow label="Total Score" value={week.totalScore} />
                  <StatRow
                    label="Accuracy"
                    value={
                      week.totalAnswered > 0
                        ? `${(
                            (week.totalCorrect / week.totalAnswered) *
                            100
                          ).toFixed(2)}%`
                        : "0%"
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

const StatRow = ({ label, value, icon }) => (
  <div className="flex justify-between items-center">
    <p className="font-semibold w-[60%]">{label}</p>
    <p className="text-lg w-[40%] flex items-center gap-2">
      {icon && (
        <img className="w-5 h-5 ml-[-20px]" src={icon} alt={`${label} icon`} />
      )}
      {value}
    </p>
  </div>
);

const groupResultsByWeek = (results) => {
  const weeksMap = new Map();
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = format(today, "MMM");
  const currentYear = today.getFullYear();

  let currentWeekLabel = "";
  if (currentDay >= 1 && currentDay <= 7)
    currentWeekLabel = `${currentMonth} 1 - 7`;
  else if (currentDay >= 8 && currentDay <= 14)
    currentWeekLabel = `${currentMonth} 8 - 14`;
  else if (currentDay >= 15 && currentDay <= 21)
    currentWeekLabel = `${currentMonth} 15 - 21`;
  else if (currentDay >= 22 && currentDay <= 28)
    currentWeekLabel = `${currentMonth} 22 - 28`;
  else {
    const lastDay = new Date(currentYear, today.getMonth() + 1, 0).getDate();
    currentWeekLabel = `${currentMonth} 29 - ${lastDay}`;
  }

  results.forEach((test) => {
    if (!test.createdAt) return;
    const testDate = new Date(test.createdAt);
    const dayOfMonth = testDate.getDate();
    const month = format(testDate, "MMM");
    const year = testDate.getFullYear();

    let weekLabel = "";
    if (dayOfMonth >= 1 && dayOfMonth <= 7) weekLabel = `${month} 1 - 7`;
    else if (dayOfMonth >= 8 && dayOfMonth <= 14) weekLabel = `${month} 8 - 14`;
    else if (dayOfMonth >= 15 && dayOfMonth <= 21)
      weekLabel = `${month} 15 - 21`;
    else if (dayOfMonth >= 22 && dayOfMonth <= 28)
      weekLabel = `${month} 22 - 28`;
    else {
      const lastDay = new Date(year, testDate.getMonth() + 1, 0).getDate();
      weekLabel = `${month} 29 - ${lastDay}`;
    }

    if (!weeksMap.has(weekLabel)) {
      weeksMap.set(weekLabel, {
        weekLabel,
        totalScore: 0,
        totalMarks: 0,
        totalAnswered: 0,
        totalCorrect: 0,
        totalWrong: 0,
        totalUnanswered: 0,
        sortOrder: weekLabel === currentWeekLabel ? -1 : null,
        refDate: new Date(year, testDate.getMonth(), 1),
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

  return Array.from(weeksMap.values()).sort((a, b) => {
    if (a.sortOrder === -1) return -1;
    if (b.sortOrder === -1) return 1;
    return b.refDate - a.refDate;
  });
};
