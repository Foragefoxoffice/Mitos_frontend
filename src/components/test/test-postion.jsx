"use client";
import React, { useState, useEffect, useContext } from "react";
import { fetchPortions, fetchSubjectsByPortions } from "@/utils/api";
import { TestContext } from "@/contexts/TestContext";
import { useRouter } from "next/navigation";
import PremiumPopup from "../PremiumPopup";

export default function Portion({ onPortionSelect, onScreenSelection }) {
  const [portions, setPortions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const { setTestData } = useContext(TestContext);
  const router = useRouter();

  // Check if user is guest
  const isGuestUser = () => {
    // Check localStorage
    if (typeof window !== 'undefined') {
      const userRole = localStorage.getItem('role') || 
                       document.cookie.split('; ').find(row => row.startsWith('role='))?.split('=')[1];
      return userRole === 'guest';
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
              return { ...portion, detailCount: Array.isArray(details) ? details.length : 0 };
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
      {loading && <p className="text-gray-500 text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && (
        <div className="portion_cards">
          <div className="portion_card">
            <h2>Full Portion Test</h2>
            <p className="text-sm text-gray-700">11th & 12th </p>

            <button 
              onClick={handleFullPortionTestClick} 
              className={`cursor-pointer ${isGuestUser() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Full Portion Test
            </button>
          </div>
          {portions.map((portion) => (
            <div key={portion.id} className="portion_card">
              <h2>{portion.name} Portion </h2>
              <p className="text-sm text-gray-700">{portion.detailCount} Subjects</p>

              <div className="btns_group">
                <button 
                  onClick={() => handleCustomPortionClick(portion)}
                  className={isGuestUser() ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Customize Chapter Test
                </button>
                <button 
                  onClick={() => handlePortionClick(portion)}
                  className={isGuestUser() ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Full Test
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showPremiumPopup && <PremiumPopup onClose={() => setShowPremiumPopup(false)} />}
    </div>
  );
}