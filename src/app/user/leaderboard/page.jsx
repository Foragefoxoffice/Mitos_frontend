"use client";

import { useEffect, useRef, useState } from "react";
import { fetchLeaderBoard } from "@/utils/api";
import Image from "next/image";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const currentUserRef = useRef(null);

  useEffect(() => {
    // Get userId from localStorage
    const userId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    setCurrentUserId(userId);
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await fetchLeaderBoard();
        setLeaderboard(data);
      } catch (err) {
        setError("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (currentUserRef.current && !loading) {
      currentUserRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [loading, leaderboard]);

  const getProfileImageUrl = (url) => {
    if (url.startsWith("/images/user/")) {
      return `https://mitoslearning${url}`;
    }
    return url;
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="mt-10 p-5">
      <h2 className="text-3xl font-bold text-left text-[#35095E] mb-6">
        Top Rankers
      </h2>
      <div className="space-y-4 ">
        {leaderboard.map((user) => {
          const isCurrentUser = user.userId === currentUserId;
          const profileImageUrl = getProfileImageUrl(
            user?.profile || "/images/user/default.png"
          );

          return (
            <div
              key={user.userId}
              ref={isCurrentUser ? currentUserRef : null}
              className={`flex justify-between items-center px-6 py-4 rounded-lg ${
                isCurrentUser
                  ? "bg-purple-100 border-2 border-purple-400"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* User Image */}
                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                 <div className="relative h-10 w-10 rounded-full overflow-hidden">
  <Image
    src={
      profileImageUrl.startsWith("http")
        ? profileImageUrl
        : `https://mitoslearning.in${profileImageUrl}`
    }
    alt="User Icon"
    width={40}
    height={40}
    className="rounded-full object-cover"
  />
</div>

                </div>

                <div>
                  <span
                    className={`font-medium text-lg ${
                      isCurrentUser ? "text-purple-800" : "text-gray-800"
                    }`}
                  >
                    {user.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-sm text-purple-600">
                        (You)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex gap-8 items-center">
                <span
                  className={`text-xl font-semibold ${
                    isCurrentUser ? "text-purple-600" : "text-gray-700"
                  }`}
                >
                  {user.totalScore}
                </span>
                <span
                  className={`text-xl font-bold ${
                    isCurrentUser ? "text-purple-700" : "text-purple-600"
                  }`}
                >
                  {parseFloat(user.accuracy).toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
