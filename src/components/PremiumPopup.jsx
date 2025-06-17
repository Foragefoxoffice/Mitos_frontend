// components/PremiumPopup.jsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function PremiumPopup({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-purple-800 mb-4">Premium Feature</h3>
        <p className="mb-6 text-gray-700">
          This feature is only available for registered users. Please login or register to access all premium features.
        </p>
        <div className="flex flex-col space-y-3">
          <Link
            href="/login"
            className="bg-purple-700 text-white py-2 px-4 rounded-lg text-center hover:bg-purple-800 transition"
            onClick={onClose}
          >
            Login
          </Link>
          <Link
            href="/register"
            className="border border-purple-700 text-purple-700 py-2 px-4 rounded-lg text-center hover:bg-purple-50 transition"
            onClick={onClose}
          >
            Register
          </Link>
          <button
            onClick={onClose}
            className="text-gray-500 bg-transparent hover:text-gray-700 mt-2"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}