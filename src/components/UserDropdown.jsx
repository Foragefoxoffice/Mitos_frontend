"use client";
import { FaAngleDown } from "react-icons/fa6";
import { HiMiniArrowUturnLeft, HiOutlineCog8Tooth, HiOutlineUserCircle } from "react-icons/hi2";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const UserDropdown = ({ user }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef(null);
  const router = useRouter();

  const togglePopup = () => {
    setIsPopupOpen((prev) => !prev);
  };

  // Close popup on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
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
    router.push("/");
  };

  const handleProfileClick = () => {
    router.push("/user/faq/profile");
    setIsPopupOpen(false);
  };

  const handleSettingsClick = () => {
    router.push("/user/settings");
    setIsPopupOpen(false);
  };

  return (
    <div>
      <button
        className="flex items-center bg-transparent space-x-2 focus:outline-none"
        onClick={togglePopup}
      >
        <img
  src={
    user?.profile
      ? user.profile.startsWith("http")
        ? user.profile
        : `https://mitoslearning.in${user.profile}`
      : "/images/user/default.png"
  }
  alt="User Icon"
  className="w-12 h-12 rounded-full object-cover"
/>

        <FaAngleDown className="text-xl text-gray-600" />
      </button>

      {/* Popup */}
      {isPopupOpen && (
        <div
          ref={popupRef}
          className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg animate-slide-down z-50"
        >
          <ul>
            <li className="px-4 py-2 flex gap-3 items-center text-gray-700 font-semibold">
              {user?.name || "Guest"}
            </li>
            <li
              className="px-4 py-2 flex gap-3 items-center hover:bg-gray-100 cursor-pointer"
              onClick={handleProfileClick}
            >
              <HiOutlineUserCircle className="text-xl text-gray-600" /> Help
            </li>
            <li
              className="px-4 py-2 flex gap-3 items-center hover:bg-gray-100 cursor-pointer"
              onClick={handleSettingsClick}
            >
              <HiOutlineCog8Tooth className="text-xl text-gray-600" /> Settings
            </li>
            <li
              className="px-4 py-2 flex gap-3 items-center hover:bg-gray-100 cursor-pointer"
              onClick={handleLogout}
            >
              <HiMiniArrowUturnLeft className="text-xl text-gray-600" /> Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;