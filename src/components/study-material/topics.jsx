"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchTopicsWithPDF } from "@/utils/api";
import PremiumPopup from "../PremiumPopup";
import CommonLoader from "@/commonLoader";

export default function MeterialsTopicsPage({
  selectedChapter,
  onTopicSelect,
  searchTerm = "",
}) {
  const searchParams = useSearchParams();
  const chapterId = selectedChapter?.id || searchParams.get("chapterId");

  const [topics, setTopics] = useState([]);
  const [chapterName, setChapterName] = useState(selectedChapter?.name || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const router = useRouter();

  const isGuestUser = () => {
    if (typeof window !== "undefined") {
      const roleFromLocal = localStorage.getItem("role");
      const roleFromCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("role="))
        ?.split("=")[1];
      return (roleFromLocal || roleFromCookie) === "guest";
    }
    return false;
  };

  useEffect(() => {
    const loadTopicsWithPDFs = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!chapterId) {
          setLoading(false);
          setError("No chapter selected.");
          return;
        }

        const resp = await fetchTopicsWithPDF(chapterId);
        const payload = resp?.data || {};
        const list = Array.isArray(payload.topics) ? payload.topics : [];

        if (selectedChapter?.name) setChapterName(selectedChapter.name);

        setTopics(list);

        if (list.length === 0) {
          setError("No topics with PDFs found in this chapter.");
        }
      } catch (err) {
        console.error("Failed to fetch topics with PDFs:", err);
        const msg =
          err?.response?.status === 404
            ? "No topics with PDFs found in this chapter."
            : "Unable to load topics. Please try again later.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadTopicsWithPDFs();
  }, [chapterId, selectedChapter?.name]);

  // 🔎 Filter by topic name
  const filteredTopics = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return topics;
    return topics.filter((t) =>
      String(t.name || "")
        .toLowerCase()
        .includes(term)
    );
  }, [topics, searchTerm]);

  const handleGoToMaterials = (topic) => {
    const locked = isGuestUser() && topic.isPremium;
    if (locked) {
      setShowPopup(true);
      return;
    }
    // One button per topic → navigate directly with that topicId
    router.push(`/user/study-materials?topicId=${topic.id}`);
  };

  const noMatches =
    !loading &&
    !error &&
    filteredTopics.length === 0 &&
    searchTerm.trim().length > 0;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-1">Study Materials</h1>
      {/* {chapterName && <h2 className="text-lg mb-4">Chapter: {chapterName}</h2>} */}

      {loading && <CommonLoader />}
      {error && <p className="text-center pt-10 text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {noMatches ? (
            <p className="text-center pt-10">No topics match your search.</p>
          ) : (
            <div className="grid mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24">
              {[...filteredTopics]
                // push locked items to bottom for guests
                .sort((a, b) => {
                  const aLocked = isGuestUser() && a.isPremium;
                  const bLocked = isGuestUser() && b.isPremium;
                  if (aLocked !== bLocked) return aLocked - bLocked;
                  return a.name.localeCompare(b.name);
                })
                .map((topic) => {
                  const locked = isGuestUser() && topic.isPremium;
                  return (
                    <div
                      key={topic.id}
                      className="rounded-xl bg-transparent p-6 text-black border border-[#ccc] shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-2xl font-semibold leading-tight truncate text-black">
                          {topic.name}
                          {locked && (
                            <span className="ml-2 text-white/80">🔒</span>
                          )}
                        </p>
                        {/* keep content same: no extra lines like "8 Topics" added */}
                      </div>

                      <div className="mt-6 flex justify-center">
                        <button
                          className={`inline-flex min-w-[220px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm
        ${
          locked
            ? "bg-white/70 text-[#5C222A]/60 cursor-not-allowed"
            : "bg-[#5C222A] text-[#fff] hover:bg-white/90 hover:text-[#5C222A]"
        }`}
                          disabled={locked}
                          onClick={() => handleGoToMaterials(topic)}
                          title={locked ? "Premium content" : "Start Studying"}
                        >
                          Start Studying
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}

      {showPopup && <PremiumPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
}
