"use client";
import React, { useState, useEffect, useContext } from "react";
import { fetchPortions, fetchSubjectsByPortions } from "@/utils/api";
import { TestContext } from "@/contexts/TestContext";
import { useRouter } from "next/navigation";
import PremiumPopup from "../PremiumPopup";
import CommonLoader from "@/commonLoader";

export default function Portion({ onPortionSelect, onScreenSelection }) {
  const [portions, setPortions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const { setTestData } = useContext(TestContext);
  const router = useRouter();
  const [fullPortionLoading, setFullPortionLoading] = useState(false);

  // Check if user is guest
  const isGuestUser = () => {
    // Check localStorage
    if (typeof window !== "undefined") {
      const userRole =
        localStorage.getItem("role") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("role="))
          ?.split("=")[1];
      return userRole === "guest";
    }
    return false;
  };

  useEffect(() => {
    const loadPortions = async () => {
      try {
        const portionsData = await fetchPortions();
        if (!Array.isArray(portionsData)) {
          throw new Error("Invalid data format received");
        }

        const portionsWithDetails = await Promise.all(
          portionsData.map(async (portion) => {
            try {
              const details = await fetchSubjectsByPortions(portion.id);
              return {
                ...portion,
                detailCount: Array.isArray(details) ? details.length : 0,
              };
            } catch {
              return { ...portion, detailCount: 0 };
            }
          })
        );

        setPortions(portionsWithDetails);
      } catch (err) {
        console.error("Failed to fetch portions:", err);
        setError("Unable to load portions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadPortions();
  }, []);

  const handleTestClick = () => {
    if (isGuestUser()) {
      setShowPremiumPopup(true);
      return;
    }
  };

  const handlePortionClick = (portion) => {
    if (isGuestUser()) {
      setShowPremiumPopup(true);
      return;
    }

    const fullPortionTestData = {
      testname: "portion-full-test",
      portionId: portion.id,
    };
    setTestData(fullPortionTestData);
    router.push("/user/test");
  };

  const handleFullPortionTestClick = () => {
    if (isGuestUser()) {
      setShowPremiumPopup(true);
      return;
    }

    setFullPortionLoading(true);

    const fullPortionTestData = {
      testname: "full-portion",
    };
    setTestData(fullPortionTestData);
    router.push("/user/test");
  };

  const handleCustomPortionClick = (portion) => {
    if (isGuestUser()) {
      setShowPremiumPopup(true);
      return;
    }

    onPortionSelect(portion);
    onScreenSelection("test-subject");
  };

  return (
    <div className="py-6">
      {loading && <CommonLoader />}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && (
        <div className="grid sm:grid-cols-2 gap-6 px-4">
          {/* Full Portion Card */}
          <div className="bg-[#00A86B] text-white rounded-xl p-6 relative shadow-md flex flex-col justify-between">
            <div className="portion-card-inner">
              <div>
                <h2 className="md:text-lg text-3xl font-semibold mb-1">
                  Full Portion
                </h2>
                <p className="text-md text-white mb-6">11th & 12th</p>
              </div>
              <div className="">
                <img
                  src="/images/practice/test-img1.png"
                  alt="Full Icon"
                  className="md:w-20 w-20"
                />
              </div>
            </div>

            <button
              onClick={handleFullPortionTestClick}
              className={`w-full hover:translate-y-[-1px] transition-all py-3 rounded-full bg-white text-green-700 font-semibold text-md ${
                isGuestUser() ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={fullPortionLoading}
            >
              {fullPortionLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mx-auto text-green-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
              ) : (
                "Full Portion Test"
              )}
            </button>
          </div>

          {/* Portion Cards */}
          {portions.map((portion) => {
            const bgColor =
              portion.name === "11th"
                ? "bg-[#B57170]"
                : portion.name === "12th"
                ? "bg-[#CDC50A]"
                : "bg-[#CDC50A]";

            const imageSrc =
              portion.name === "11th"
                ? "/images/practice/test-img1.png"
                : portion.name === "12th"
                ? "/images/practice/test-img1.png"
                : "/images/practice/test-img1.png";

            const btnText =
              portion.name === "11th"
                ? "text-[#B57170]"
                : portion.name === "12th"
                ? "text-[#CDC50A]"
                : "text-[#CDC50A]";

            return (
              <div
                key={portion.id}
                className={`text-white rounded-xl  p-6 relative shadow-md ${bgColor}`}
              >
                <div className="portion-card-inner">
                  <div>
                    <h2 className="md:text-lg text-3xl font-semibold mb-1">
                      {portion.name} Portion
                    </h2>
                    <p className="text-md text-white mb-6">
                      {portion.detailCount} Subjects
                    </p>
                  </div>
                  <div>
                    <img
                      src={imageSrc}
                      alt={`${portion.name} Icon`}
                      className="md:w-16 w-16"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleCustomPortionClick(portion)}
                    className={`w-full hover:translate-y-[-1px] transition-all md:mt-2 mt-14 py-3 rounded-full bg-white ${btnText} font-semibold text-md ${
                      isGuestUser() ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Custom Chapter Test
                  </button>
                  <button
                    onClick={() => handlePortionClick(portion)}
                    className={`w-full py-3 hover:translate-y-[-1px] transition-all rounded-full bg-white ${btnText} font-semibold text-md ${
                      isGuestUser() ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Full Test
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showPremiumPopup && (
        <PremiumPopup onClose={() => setShowPremiumPopup(false)} />
      )}
    </div>
  );
}
