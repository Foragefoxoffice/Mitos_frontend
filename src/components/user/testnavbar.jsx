'use client';
import { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { HiMiniArrowUturnLeft, HiOutlineCog8Tooth, HiOutlineUserCircle } from "react-icons/hi2";
import Image from "next/image";

const TestNavbar = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef(null);
  const [user, setUser] = useState(null);

  const togglePopup = () => {
    setIsPopupOpen((prev) => !prev);
  };

  // Close popup on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false); // Close the popup
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("refreshToken");
     // Remove token from storage
    setUser(null); // Clear user state
    router.push("/"); // Redirect to login page
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token"); // Get token from localStorage

      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        const response = await fetch("https://mitoslearning.in/api/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send token in the header
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);


  return (
    <div className="">
      <div className="test_header flex justify-between">
       
          <h1 className="font-bold text-xl md:text-3xl">Practice Test</h1>
          <Image src={"/images/logo/logo.png"}  className="hidden md:block" alt="logo" width={150} height={80} />
        <div className="">
          {/* User Icon */}
          <button
            className="flex items-center  bg-transparent space-x-2 focus:outline-none"
            onClick={togglePopup}
          >
          <img
              src={user?.profile || "/images/user/default.png"}
              alt="User Icon"
              className="w-12 h-12 rounded-full"
            />
            <FaAngleDown className="text-xl text-gray-600" />
          </button>

          {/* Popup */}
          {isPopupOpen && (
            <div
              ref={popupRef} // Attach the reference to the popup
              className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg animate-slide-down"
            >
              {/* Menu */}
              <ul>
              <li className="px-4 py-2 flex gap-3 items-center text-gray-700 font-semibold">
                  {user?.name || "Guest"}
                </li>
                <li className="px-4 py-2 flex gap-3 items-center hover:bg-gray-100 cursor-pointer">
                  <HiOutlineUserCircle className="text-xl text-gray-600" /> Profile
                </li>
                <li className="px-4 py-2 flex gap-3 items-center hover:bg-gray-100 cursor-pointer">
                  <HiOutlineCog8Tooth className="text-xl text-gray-600" /> Settings
                </li>
                <li className="px-4 py-2 flex gap-3 items-center hover:bg-gray-100 cursor-pointer">
                  <HiMiniArrowUturnLeft className="text-xl text-gray-600" /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default TestNavbar;
