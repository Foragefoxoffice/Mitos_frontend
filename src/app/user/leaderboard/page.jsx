"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchLeaderBoard } from "@/utils/api";
import Image from "next/image";
import Link from "next/link";
import CommonLoader from "@/commonLoader";
import { BsGraphUpArrow } from "react-icons/bs";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const currentUserRef = useRef(null);

  const initialCount = 8;
  const [visibleCount, setVisibleCount] = useState(initialCount);

  // News box
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uid = localStorage.getItem("userId");
      if (uid) setCurrentUserId(uid);
    }
  }, []);

  const getProfileImageUrl = (url = "") => {
    if (!url) return "/images/user/default.png";
    if (url.startsWith("/images/user/"))
      return `https://mitoslearning.in${url}`;
    return url;
  };

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const getTotalScore = (u) => {
    const candidates = [
      u.totalScore,
      u.total_score,
      u.score,
      u.marks,
      u.points,
    ];
    for (const c of candidates) {
      const n = toNumber(c);
      if (n !== 0) return n;
    }
    return 0;
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const raw = await fetchLeaderBoard();
        const arr = Array.isArray(raw) ? raw : [];

        const withScore = arr.map((u) => ({
          ...u,
          totalScore: getTotalScore(u),
        }));

        withScore.sort((a, b) => b.totalScore - a.totalScore);

        let lastScore = null;
        let lastRank = 0;
        const ranked = withScore.map((u, i) => {
          const rank =
            lastScore !== null && u.totalScore === lastScore ? lastRank : i + 1;
          lastScore = u.totalScore ?? 0;
          lastRank = rank;
          return { ...u, rank };
        });

        setLeaderboard(ranked);

        if (currentUserId) {
          const me = ranked.find(
            (u) => String(u.userId) === String(currentUserId)
          );
          setCurrentUserRank(me || null);
        } else {
          setCurrentUserRank(null);
        }
      } catch (e) {
        console.error(e);
        setError("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUserId]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        setNewsError(null);

        const resp = await fetch("https://mitoslearning.in/api/news");
        if (!resp.ok) throw new Error("Failed to fetch news");
        const data = await resp.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : data?.data
          ? [data.data]
          : [data];

        setNewsItems(list.slice(0, 5));
      } catch (err) {
        console.error(err);
        setNewsError("Failed to load news");
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    if (currentUserRef.current && !loading) {
      currentUserRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [loading, leaderboard]);

  const ordinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const top3 = leaderboard.slice(0, 3);

  const rankMap = useMemo(() => {
    const m = new Map();
    leaderboard.forEach((u) => m.set(String(u.userId), u.rank || 0));
    return m;
  }, [leaderboard]);

  const others = useMemo(
    () => leaderboard.filter((u) => String(u.userId) !== String(currentUserId)),
    [leaderboard, currentUserId]
  );

  const visibleOthersCount = useMemo(() => {
    const reserved = currentUserRank ? 1 : 0;
    return Math.min(others.length, Math.max(0, visibleCount - reserved));
  }, [others.length, visibleCount, currentUserRank]);

  const rows = useMemo(() => {
    if (currentUserRank)
      return [currentUserRank, ...others.slice(0, visibleOthersCount)];
    return others.slice(0, visibleOthersCount);
  }, [currentUserRank, others, visibleOthersCount]);

  const canShowMore = visibleOthersCount < others.length;

  if (loading) return <CommonLoader />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-5 md:p-10 bg-[#F2F8FE] min-h-screen">
      {/* Top Section */}
      <div className="grid md:grid-cols-2 items-start gap-6 mb-10">
        {/* Top Rankers */}
        <div className="bg-white rounded-2xl pt-6 pb-0 pr-6 pl-6 shadow-md">
          <h2 className="text-xl font-bold text-black mb-4 flex justify-end items-center gap-2">
            <BsGraphUpArrow /> Top Rankers (by Total Score)
          </h2>
          <div className="flex gap-3 justify-center items-end">
            {top3.map((user, index) => {
              const palette = [
                { block: "bg-[#FF6B6B]", text: "text-[#FF6B6B]" },
                { block: "bg-[#F7941D]", text: "text-[#F7941D]" },
                { block: "bg-[#5041BC]", text: "text-[#5041BC]" },
              ];
              const heights = ["h-32 md:h-52", "h-24 md:h-36", "h-16 md:h-28"];
              const rankNum = user.rank ?? index + 1;
              const p = palette[index] || palette[2];
              return (
                <div
                  key={String(user.userId)}
                  className="flex flex-col items-center"
                >
                  <div className="grid md:flex items-center gap-0 md:gap-2 mb-2">
                    <Image
                      src={getProfileImageUrl(user.profile)}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full mb-2 w-10 h-10"
                    />
                    <span className=" font-semibold text-sm md:text-lg">
                      {user.name || "User"}
                    </span>
                  </div>
                  <span className={`text-2xl ${p.text}`}>
                    {(user.totalScore ?? 0).toLocaleString()} pts
                  </span>
                  <div
                    className={`w-[90px] md:w-[150px] mt-3 ${heights[index]} ${p.block} rounded-t-3xl flex items-center justify-center text-white text-xl font-bold`}
                  >
                    {rankNum}
                    <sup className="text-2xl ml-1">{ordinal(rankNum)}</sup>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* News */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-black mb-4">Latest News</h2>
          {newsLoading && <CommonLoader />}
          {newsError && <p className="text-red-500">{newsError}</p>}
          {!newsLoading && !newsError && newsItems.length === 0 && (
            <p className="text-sm text-gray-500">
              No news available right now.
            </p>
          )}
          {!newsLoading && !newsError && newsItems.length > 0 && (
            <div className="space-y-3">
              {newsItems.map((n) => {
                const id = n.id ?? n._id ?? n.slug ?? n.newsId ?? "";
                const title = n.title ?? n.heading ?? "Untitled";
                const thumb =
                  n.image ?? n.thumbnail ?? "/images/user/default.png";
                const createdAt = n.createdAt ?? n.publishedAt ?? n.date;
                const href = id ? `/news/${id}` : "#";
                return (
                  <Link
                    key={id || title}
                    href={href}
                    className="group flex items-center gap-3 rounded-lg border bg-[#F9FAFB] p-3 hover:bg-white hover:shadow transition"
                  >
                    <div className="relative w-14 h-14 rounded-md overflow-hidden shrink-0">
                      <Image
                        src={thumb}
                        alt={title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-[#017bcd]">
                        {title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(createdAt)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {!currentUserRank && (
        <div className="mt-10 p-4 mb-6 rounded-xl bg-white border-2 border-yellow-500 shadow-sm">
          <h3 className="text-lg font-bold mb-3 text-yellow-700">
            ⚠️ You're not currently ranked
          </h3>
          <p>Complete more tests to appear on the leaderboard!</p>
        </div>
      )}

      {rows.map((user) => {
        const isCurrentUser = String(user.userId) === String(currentUserId);
        const trueRank = rankMap.get(String(user.userId)) ?? user.rank ?? 0;
        const acc =
          user.accuracy != null
            ? `${parseFloat(String(user.accuracy)).toFixed(0)}%`
            : "—";
        const totalScore = user.totalScore ?? getTotalScore(user);
        return (
          <div
            key={String(user.userId)}
            ref={isCurrentUser ? currentUserRef : null}
            className={`grid grid-cols-12 mb-5 items-center px-6 py-4 text-sm rounded-xl ${
              isCurrentUser
                ? "bg-[#FFFDF2] border-2 border-yellow-400"
                : "bg-[#F2FAFF] border border-[#007ACC40]"
            }`}
          >
            <div className="col-span-2 flex items-center text-black text-lg font-semibold">
              #{trueRank}
              <sup className="ml-0.5">{ordinal(trueRank)}</sup>
              {isCurrentUser && (
                <span className="ml-2 text-xs font-bold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>
            <div className="col-span-5 flex items-center gap-3">
              <Image
                src={getProfileImageUrl(user.profile)}
                width={30}
                height={30}
                alt="Profile"
                className="rounded-full w-10 h-10"
              />
              <span className="font-medium">{user.name || "User"}</span>
            </div>
            {/* <div className="col-span-3 font-semibold text-green-600">{acc}</div> */}
            <div className="col-span-2 flex justify-end">
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  totalScore > 0
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {(totalScore || 0).toLocaleString()} pts
              </span>
            </div>
          </div>
        );
      })}

      {leaderboard.length > initialCount && (
        <div className="text-center mt-4">
          {canShowMore ? (
            <button
              onClick={() =>
                setVisibleCount(others.length + (currentUserRank ? 1 : 0))
              }
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
