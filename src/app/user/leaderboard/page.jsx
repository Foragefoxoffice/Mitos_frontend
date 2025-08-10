"use client";

import { useEffect, useRef, useState } from "react";
import { fetchLeaderBoard } from "@/utils/api";
import Image from "next/image";
import CommonLoader from "@/commonLoader";
import { FaEllipsisV } from "react-icons/fa";
import { FaSortUp } from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa";
import { BsGraphUpArrow } from "react-icons/bs";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const currentUserRef = useRef(null);
  const initialCount = 8;
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      if (userId) {
        setCurrentUserId(userId);
      } else {
        setLoading(false); // Don't keep loading if no user ID
      }
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchData = async () => {
      try {
        const data = await fetchLeaderBoard();
        setLeaderboard(data);

        const userIndex = data.findIndex(
          (user) => user.userId === currentUserId
        );

        console.log("User index:", userIndex); // Debug log
        console.log("Current user ID:", currentUserId); // Debug log

        if (userIndex !== -1) {
          setCurrentUserRank({
            ...data[userIndex],
            rank: userIndex + 1,
          });
        } else {
          console.warn("Current user not found in leaderboard");
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserRef.current && !loading) {
      currentUserRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [loading, leaderboard]);

  const getProfileImageUrl = (url) => {
    if (url.startsWith("/images/user/"))
      return `https://mitoslearning.in${url}`;
    return url;
  };

  const getRankIcon = (rank, change) => {
    if (change === "up") return <FaSortUp className="text-green-500 mr-1" />;
    if (change === "down") return <FaCaretDown className="text-red-500 mr-1" />;
    return <span className="text-gray-400 mr-1">-</span>;
  };

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  if (loading) return <CommonLoader />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-5 md:p-10 bg-[#F2F8FE] min-h-screen">
      {/* Top Section */}
      <div className="grid md:grid-cols-2 items-end gap-6 mb-10">
        {/* Bar Graph Section */}
        <div className="bg-white rounded-2xl pt-6 pb-0 pr-6 pl-6 shadow-md">
          <h2 className="text-xl font-bold text-black mb-4 flex justify-end items-center gap-2">
            <BsGraphUpArrow /> Top Rankers
          </h2>
          <div className="flex gap-3 justify-center items-end">
            {top3.map((user, index) => {
              const rankColor = [
                "bg-[#FF6B6B]",
                "bg-[#F7941D]",
                "bg-[#5041BC]",
              ];
              const rankPercent = [
                "text-[#FF6B6B]",
                "text-[#F7941D]",
                "text-[#5041BC]",
              ];
              const heights = ["h-32 md:h-52", "h-24 md:h-36", "h-16 md:h-28"];
              return (
                <div key={user.userId} className="flex flex-col items-center">
                  <div className="grid md:flex items-top gap-0 md:gap-2 mb-2">
                    <Image
                      src={getProfileImageUrl(
                        user.profile || "/images/user/default.png"
                      )}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full mb-2"
                    />
                    <span className="mt-2 font-semibold text-sm md:text-lg">
                      {user.name}
                    </span>
                  </div>

                  <span className={`text-2xl ${rankPercent[index]}`}>
                    {parseFloat(user.accuracy).toFixed(0)}%
                  </span>
                  <div
                    className={`w-[90px] md:w-[150px] mt-3 ${heights[index]} ${rankColor[index]} rounded-t-3xl flex items-center justify-center text-white text-xl font-bold`}
                  >
                    {index + 1}
                    <sup className="text-2xl ml-1">st</sup>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* NEET Updates */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">NEET Updates</h2>
          {[1, 2].map((_, i) => (
            <div
              key={i}
              className="flex items-center mb-4 bg-[#F9FAFB] p-4 rounded-lg"
            >
              <Image
                src="/images/user/default.png"
                alt="News"
                width={60}
                height={60}
                className="rounded-lg mr-4"
              />
              <div className="flex-1">
                <span className="text-xs bg-red-100 text-red-500 px-2 py-1 rounded-md">
                  News
                </span>
                <h3 className="font-semibold mt-2 text-sm">
                  NEET 2025 Syllabus
                </h3>
                <p className="text-xs text-gray-400">Dec 25, 2025 • 👁️ 111</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {currentUserRank ? (
        <div className="mt-10 p-4 mb-6 rounded-xl bg-white border-2 border-green-500 shadow-sm">
          <h3 className="text-lg font-bold mb-3 text-green-700">
            🎯 Your Rank
          </h3>
          <div className="grid grid-cols-12 items-center px-4 py-3 text-sm bg-[#F2FAFF] rounded-lg border border-[#007ACC40]">
            <div className="col-span-2 text-black text-lg font-semibold">
              #{currentUserRank.rank}
            </div>
            <div className="col-span-6 flex items-center gap-3">
              <Image
                src={getProfileImageUrl(
                  currentUserRank.profile || "/images/user/default.png"
                )}
                width={30}
                height={30}
                alt="Profile"
                className="rounded-full"
              />
              <span className="font-medium">{currentUserRank.name}</span>
            </div>
            <div className="col-span-3 font-semibold text-green-600">
              {parseFloat(currentUserRank.accuracy).toFixed(0)}%
            </div>
            <div className="col-span-1 text-center text-gray-400">
              <FaEllipsisV />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-10 p-4 mb-6 rounded-xl bg-white border-2 border-yellow-500 shadow-sm">
          <h3 className="text-lg font-bold mb-3 text-yellow-700">
            ⚠️ You're not currently ranked
          </h3>
          <p>Complete more tests to appear on the leaderboard!</p>
        </div>
      )}

      {/* Leaderboard Table */}
      {[
        ...leaderboard.slice(0, visibleCount),
        ...(currentUserRank &&
        !leaderboard
          .slice(0, visibleCount)
          .some((u) => u.userId === currentUserId)
          ? [currentUserRank]
          : []),
      ].map((user, index) => {
        const isCurrentUser = user.userId === currentUserId;
        const rankChange = index === 0 ? "up" : index === 1 ? "down" : null;

        return (
          <div
            key={user.userId}
            ref={isCurrentUser ? currentUserRef : null}
            className={`grid grid-cols-12 mb-5 items-center px-6 py-4 text-sm ${
              isCurrentUser ? "bg-[#F2FAFF]" : "bg-[#F2FAFF]"
            } border border-[#007ACC40] rounded-xl`}
          >
            <div className="col-span-2 flex items-center text-black text-lg font-semibold">
              {getRankIcon(index + 1, rankChange)}
              {index + 1}
              <sup className="ml-0.5">th</sup>
            </div>
            <div className="col-span-6 flex items-center gap-3">
              <Image
                src={getProfileImageUrl(
                  user.profile || "/images/user/default.png"
                )}
                width={30}
                height={30}
                alt="Profile"
                className="rounded-full"
              />
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="col-span-3 font-semibold text-green-600">
              {parseFloat(user.accuracy).toFixed(0)}%
            </div>
            <div className="col-span-1 text-center text-gray-400">
              <FaEllipsisV />
            </div>
          </div>
        );
      })}

      {leaderboard.length > initialCount && (
        <div className="text-center mt-4">
          {visibleCount < leaderboard.length ? (
            <button
              onClick={() => setVisibleCount(leaderboard.length)}
              className="px-6 py-2 bg-[#017bcd] text-white rounded-full hover:bg-[#005fa3] transition"
            >
              Show More
            </button>
          ) : (
            <button
              onClick={() => setVisibleCount(initialCount)}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition"
            >
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
