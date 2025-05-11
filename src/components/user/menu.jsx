"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FiHome,
  FiTrendingUp,
  FiAward,
  FiHeart,
  FiHelpCircle,
  FiBell,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiMenu,
  FiX
} from "react-icons/fi";

const navItems = [
  {
    title: "Menus",
    items: [
      {
        title: "Home",
        icon: <FiHome size={18} />,
        href: "/user/dashboard",
      },
      {
        title: "Learning Progress",
        icon: <FiTrendingUp size={18} />,
        href: "/user/progress",
      },
      {
        title: "Leader Board",
        icon: <FiAward size={18} />,
        href: "/user/leaderboard",
      },
      {
        title: "Favorite",
        icon: <FiHeart size={18} />,
        href: "/user/favorite",
      },
      {
        title: "FAQ's",
        icon: <FiHelpCircle size={18} />,
        href: "/user/faq",
      },
      {
        title: "News",
        icon: <FiBell size={18} />,
        href: "/user/news",
      },
      {
        title: "Settings",
        icon: <FiSettings size={18} />,
        href: "/user/settings",
      },
    ],
  },
];

const Menu = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <div className={`md:hidden fixed left-4 z-50 ${isMobileMenuOpen ? 'top-2 left-[12rem]' : 'relative '}`}>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg bg-purple-700 text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-40 transform' : 'relative'}
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
          md:translate-x-0 transition-transform duration-300 ease-in-out
          bg-[#35095E] text-white h-screen
        `}
      >
        <div className="space-y-1 pt-16 md:pt-6 ">
          {navItems.map((navGroup) => (
            <div key={navGroup.title} className="overflow-hidden">
              <div className=" py-1 space-y-1">
                {navGroup.items.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => isMobile && setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg mx-2 transition-colors duration-200 ${
                      isActive(item.href)
                        ? "bg-white text-[#35095E]"
                        : "text-white hover:bg-purple-800"
                    }`}
                  >
                     <span className={`${
                    isActive(item.href) ? "text-[#35095E]" : "text-white"
                  }`}>
                      {item.icon}
                    </span>
                    <span className={`${
                      isActive(item.href) ? "font-medium text-[#35095E]" : "text-white"
                    }`}>
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Menu;