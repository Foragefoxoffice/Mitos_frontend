"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiX, FiXCircle, FiInfo, FiAlertTriangle } from "react-icons/fi";
import { useEffect } from "react";

const Notification = ({ message, type = "success", onClose, duration = 3000 }) => {
  const config = {
    success: {
      icon: <FiCheck className="mr-2 "  />,
      bgColor: "bg-green-500",
    },
    error: {
      icon: <FiXCircle className="mr-2" />,
      bgColor: "bg-red-500",
    },
    info: {
      icon: <FiInfo className="mr-2" />,
      bgColor: "bg-blue-500",
    },
    warning: {
      icon: <FiAlertTriangle className="mr-2" />,
      bgColor: "bg-yellow-500 text-black",
    },
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
        className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl ${config[type].bgColor} text-white flex items-center space-x-2 min-w-[280px]`}
      >
        {config[type].icon}
        <span className="flex-1 text-white">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 bg-white text-[#35095E] hover:bg-white/20 rounded-full p-1 transition"
        >
          <FiX className="text-lg" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default Notification;
