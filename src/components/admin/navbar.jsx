'use client';
import { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { HiMiniArrowUturnLeft, HiOutlineCog8Tooth, HiOutlineUserCircle } from "react-icons/hi2";

const Navbar = () => {
  const [title, setTitle] = useState("Default Title");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef(null);

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

  // Update title based on the current path
  useEffect(() => {
    const path = window.location.pathname;

    // Define titles for different paths
    const pageTitles = {
      "/admin/dashboard": "Dashboard",
      "/admin/types": "Types",
      "/admin/upload": "Questions Upload",
      "/admin/questions": "Questions",
    };

    setTitle(pageTitles[path] || "Default Title");
  }, [window.location.pathname]); // Add pathname as a dependency

  return (
    <div>
      <div className="flex justify-between">
        <div className="">
          <h1 className="font-bold">{title}</h1>
        </div>
        <div className="">
          {/* User Icon */}
          <button
            className="flex items-center  bg-transparent space-x-2 focus:outline-none"
            onClick={togglePopup}
          >
            <img
              src="/images/user/default.png" // Replace with your user icon
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

export default Navbar;
