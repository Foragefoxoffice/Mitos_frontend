"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import PremiumPopup from "../PremiumPopup";
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
        allowedRoles: ['guest', 'user', 'admin'] // All roles can access
      },
      {
        title: "Learning Progress",
        icon: <FiTrendingUp size={18} />,
        href: "/user/progress",
        allowedRoles: ['user', 'admin'] // Guests cannot access
      },
      {
        title: "Leader Board",
        icon: <FiAward size={18} />,
        href: "/user/leaderboard",
        allowedRoles: ['user', 'admin']
      },
      {
        title: "Favorite",
        icon: <FiHeart size={18} />,
        href: "/user/favorite",
        allowedRoles: ['user', 'admin']
      },
      {
        title: "FAQ's",
        icon: <FiHelpCircle size={18} />,
        href: "/user/faq",
        allowedRoles: ['user', 'admin']
      },
      {
        title: "News",
        icon: <FiBell size={18} />,
        href: "/user/news",
        allowedRoles: ['user', 'admin']
      },
      {
        title: "Settings",
        icon: <FiSettings size={18} />,
        href: "/user/settings",
        allowedRoles: ['user', 'admin']
      },
    ],
  },
];

const Menu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userRole, setUserRole] = useState('guest'); // Default to guest
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  const handlePremiumClick = (e) => {
    e.preventDefault();
    setShowPremiumPopup(true);
  };

  useEffect(() => {
    // Get user role from storage
    const role = localStorage.getItem('role') || 'guest';
    setUserRole(role);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  const handleNavigation = (href, allowedRoles) => {
    if (!allowedRoles.includes(userRole)) {
      // Redirect guests trying to access restricted pages
      if (userRole === 'guest') {
        router.push('/user/dashboard');
      }
      return false;
    }
    return true;
  };

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
              <div className="py-1 space-y-1">
                {navGroup.items.map((item) => {
                  const isAllowed = item.allowedRoles.includes(userRole);
                  const isDisabled = !isAllowed;
                  
                  return isAllowed ? (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => {
                        if (isMobile) setIsMobileMenuOpen(false);
                      }}
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
                  ) : (
                    <button
                      key={item.title}
                      onClick={handlePremiumClick}
                      className={`flex items-center gap-3 p-3 rounded-lg mx-2 w-full text-left ${
                        isActive(item.href)
                          ? "bg-white text-[#35095E]"
                          : "text-white hover:bg-purple-800"
                      } opacity-50`}
                    >
                      <span className="text-white">
                        {item.icon}
                      </span>
                      <span className="text-white">
                        {item.title}
                        <span className="ml-2 text-xs text-yellow-300">(Premium)</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Popup */}
      {showPremiumPopup && (
        <PremiumPopup onClose={() => setShowPremiumPopup(false)} />
      )}

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