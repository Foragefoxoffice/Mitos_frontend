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

  // NEW → helpers to decide lock based on PDFs too
  const topicHasPremiumPdf = (topic) =>
    Array.isArray(topic?.pdf) && topic.pdf.some((p) => !!p?.isPremium);

  const isLockedForGuest = (topic) =>
    isGuestUser() && (topic?.isPremium || topicHasPremiumPdf(topic));

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

  // UPDATED: lock if guest & any PDF is premium (or topic.isPremium)
  const handleGoToMaterials = (topic) => {
    if (isLockedForGuest(topic)) {
      setShowPopup(true);
      return;
    }
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
                  const aLocked = isLockedForGuest(a);
                  const bLocked = isLockedForGuest(b);
                  if (aLocked !== bLocked) return aLocked - bLocked;
                  return a.name.localeCompare(b.name);
                })
                .map((topic) => {
                  const locked = isLockedForGuest(topic);

                  return (
                    <div
                      key={topic.id}
                      className="rounded-xl bg-transparent p-6 text-black border border-[#ccc] shadow-sm place-content-center"
                    >
                      <div className="min-w-0">
                        <p className="text-2xl font-semibold leading-tight text-black whitespace-normal break-words">
                          {topic.name}
                          {locked && (
                            <span className="ml-2 align-middle text-[#b45309]">
                              🔒
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="mt-6 flex justify-center">
                        <button
                          // keep clickable so popup can appear
                          aria-disabled={locked}
                          onClick={() => handleGoToMaterials(topic)}
                          className={`inline-flex min-w-[220px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition
                            ${
                              locked
                                ? "bg-white/70 text-[#5C222A]/60 hover:bg-white/80"
                                : "bg-[#5C222A] text-white hover:bg-white/90 hover:text-[#5C222A]"
                            }`}
                          title={
                            locked ? "Premium content (login/upgrade)" : "Start Studying"
                          }
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
