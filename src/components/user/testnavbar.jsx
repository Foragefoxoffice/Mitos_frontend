'use client';
import { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { HiMiniArrowUturnLeft, HiOutlineCog8Tooth, HiOutlineUserCircle } from "react-icons/hi2";
import Image from "next/image";

const TestNavbar = () => {
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


  return (
    <div className="">
      <div className="test_header flex justify-between">
       
          <h1 className="font-bold">Practice Test</h1>
          <Image src={"/images/logo/logo.png"} alt="logo" width={150} height={80} />
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

export default TestNavbar;
