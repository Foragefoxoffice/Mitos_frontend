"use client";

import React from "react";
import { motion } from "framer-motion";

const privacySections = [
  {
    title: "Who We Are & Contact",
    content: (
      <div className="space-y-2">
        <p>
          <strong>Entity:</strong> Mitos Learning (OPC) Private Limited
        </p>
        <p>
          <strong>Registered Address:</strong> 13/1-116, Mettur, Salem, Tamil Nadu – 636403
        </p>
        <p>
          <strong>Grievance Officer Contact:</strong>
        </p>
        <ul className="list-disc pl-5">
          <li>Email: <a href="mailto:support@mitoslearning.in" className="text-blue-600 underline">support@mitoslearning.in</a></li>
          <li>Phone: <a href="tel:9360370336" className="text-blue-600 underline">9360370336</a></li>
          <li>Postal: same as registered address</li>
        </ul>
        <p className="text-sm text-gray-500">
          We will acknowledge grievances within 24 hours and aim to resolve them within 15 days.
        </p>
      </div>
    ),
  },
  {
    title: "Information We Collect",
    content: (
      <ul className="list-decimal pl-5 space-y-1">
        <li>Login Data: Google Sign-In basic profile (name, email, profile ID).</li>
        <li>Additional Info: Contact number and class/grade you provide.</li>
        <li>Usage Data: Tests taken, scores, time spent, device details, app version, IP address.</li>
        <li>Analytics: We use Google Analytics to understand usage and improve features.</li>
        <li>Cookies: Essential and non-essential cookies to operate and improve the Platform.</li>
        <li>Communications: Emails or messages you send to us, feedback, surveys.</li>
        <li className="mt-1 font-semibold">Note: We do not collect payment information at present, as the Platform is free.</li>
      </ul>
    ),
  },
  {
    title: "How We Use Your Information",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Create and manage your account.</li>
        <li>Provide personalized learning content.</li>
        <li>Analyze performance to improve features.</li>
      </ul>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen p-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className=" mx-auto rounded-2xl"
      >
        <h1 className="text-5xl font-bold text-center text-blue-700 mb-12">
          Privacy Policy
        </h1>
        {privacySections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
            className="mb-10 p-6 bg-blue-50 rounded-xl border-l-8 border-blue-500 shadow-md"
          >
            <h2 className="text-3xl font-semibold text-blue-600 mb-4">{section.title}</h2>
            <div className="text-gray-700">{section.content}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
