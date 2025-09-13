"use client";

import React from "react";
import { motion } from "framer-motion";

const termsSections = [
  {
    title: "Eligibility & Accounts",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>You must be at least 14 years old to use the Platform.</li>
        <li>You agree to provide accurate information during registration (Google Sign-In, phone number, class).</li>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
      </ul>
    ),
  },
  {
    title: "Services",
    content: <p>We provide NEET preparation practice tests, study materials, and analytics. Our services are currently free and require only login.</p>,
  },
  {
    title: "Intellectual Property",
    content: <p>All Platform content (questions, solutions, explanations, UI, logos, trademarks) is owned by Mitos Learning (OPC) Private Limited. We grant you a limited, non-transferable, revocable license to use the Platform for personal learning purposes.</p>,
  },
  {
    title: "User Conduct",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Share, copy, or redistribute our content without permission is prohibited.</li>
        <li>Do not cheat, misuse, or interfere with the Platform’s operation.</li>
        <li>Do not introduce viruses, reverse engineer, or harm our systems.</li>
      </ul>
    ),
  },
  {
    title: "Cookies & Analytics",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>We use cookies and similar technologies (including Google Analytics) to operate the Platform, maintain login sessions, and analyze usage to improve features.</li>
        <li>Essential cookies are required for the Platform to function properly.</li>
        <li>By using the Platform, you consent to our use of cookies and analytics as described here and in the Privacy Policy.</li>
        <li>You may disable non-essential cookies via your browser settings, but some features may not work.</li>
      </ul>
    ),
  },
  {
    title: "Privacy & Data Handling",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>We collect and process personal information including name, email (from Google Sign-In), contact number, class, and usage data to provide and improve our services.</li>
        <li>We do not currently collect payment information.</li>
        <li>Full details are in our Privacy Policy (incorporated into these Terms).</li>
        <li>We may send you promotional emails/SMS; you may opt out at any time.</li>
      </ul>
    ),
  },
  {
    title: "Data Deletion Requests",
    content: <p>You may request deletion of your Mitos Learning account and associated personal data by emailing support@mitoslearning.in from the email used to sign up with the subject line “Delete My Data.” We will acknowledge within 24 hours and complete deletion within 15 days as per Indian law.</p>,
  },
  {
    title: "Communications",
    content: <p>You consent to receive service-related messages (OTP, notices, updates) and promotional communications. You can opt out of promotional communications but not essential service messages.</p>,
  },
  {
    title: "Payments & Refunds",
    content: <p>Currently, the Platform is free. If we introduce paid plans, a separate payment and refund policy will be published.</p>,
  },
  {
    title: "Disclaimers",
    content: <p>We strive for accurate and helpful content but do not guarantee exam outcomes. The Platform is provided “as is” without warranties of any kind.</p>,
  },
  {
    title: "Limitation of Liability",
    content: <p>To the maximum extent permitted by law, Mitos Learning is not liable for indirect or consequential damages arising from your use of the Platform. Our total liability shall not exceed the amount you paid to us in the last six months (currently zero as the service is free).</p>,
  },
  {
    title: "Governing Law & Jurisdiction",
    content: <p>These Terms are governed by the laws of India. The courts of Tamil Nadu, India have exclusive jurisdiction over disputes.</p>,
  },
  {
    title: "Changes to Terms",
    content: <p>We may modify these Terms at any time. Continued use of the Platform after changes means you accept the revised Terms.</p>,
  },
  {
    title: "Contact & Grievance Officer",
    content: (
      <div className="space-y-2">
        <p>Mitos Learning (OPC) Private Limited</p>
        <p>13/1-116, Mettur, Salem, Tamil Nadu – 636403</p>
        <p>Email: <a href="mailto:support@mitoslearning.in" className="text-blue-600 underline">support@mitoslearning.in</a></p>
        <p>Phone: <a href="tel:9360370336" className="text-blue-600 underline">9360370336</a></p>
        <p className="text-sm">We will acknowledge grievances within 24 hours and aim to resolve them within 15 days.</p>
      </div>
    ),
  },
];

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen p-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto space-y-10"
      >
        <h1 className="text-5xl font-bold text-center text-blue-700 mb-8">Terms & Conditions</h1>

        {termsSections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <h2 className="text-3xl font-semibold text-blue-600 mb-3">{section.title}</h2>
            <div className="text-gray-700">{section.content}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
