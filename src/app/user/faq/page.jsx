"use client";
import { useEffect, useState } from "react";
import {
  FaQuestionCircle,
  FaBookMedical,
  FaMobileAlt,
  FaSyncAlt,
  FaLightbulb,
  FaChartPie,
  FaRegMoneyBillAlt,
  FaKey,
  FaTools,
  FaMoneyBillWave,
} from "react-icons/fa";
import { RiTestTubeFill } from "react-icons/ri";
import { GiBrain } from "react-icons/gi";

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState(0); // First one open by default

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      icon: <FaQuestionCircle />,
      question: "What is this NEET mock test platform?",
      answer:
        "Our platform provides high-quality mock tests designed to simulate the actual NEET exam experience. We offer comprehensive question banks, detailed performance analytics, and personalized feedback to help students prepare effectively.",
    },
    {
      icon: <RiTestTubeFill />,
      question: "How are your mock tests different from others?",
      answer:
        "Our tests are created by NEET experts and follow the latest NTA pattern strictly. We provide: 1) Detailed solutions with explanations, 2) Performance comparison with toppers, 3) Adaptive test recommendations, and 4) Real-time exam interface simulation.",
    },
    {
      icon: <FaRegMoneyBillAlt />,
      question: "What payment options are available?",
      answer:
        "We accept all major credit/debit cards, UPI payments, net banking, and popular digital wallets. We also offer EMI options for some subscription plans.",
    },
    {
      icon: <FaMobileAlt />,
      question: "Can I access the tests on mobile devices?",
      answer:
        "Yes, our platform is fully responsive and works on smartphones, tablets, and desktops. We recommend using our dedicated mobile app for the best experience.",
    },
    {
      icon: <FaSyncAlt />,
      question: "How often are new mock tests added?",
      answer:
        "We add new full-length mock tests every week and update our question bank daily with new questions based on recent trends and analysis.",
    },
    {
      icon: <FaLightbulb />,
      question: "Do you provide solutions for the questions?",
      answer:
        "Yes, every question comes with a detailed solution that includes explanations, diagrams where needed, and references to NCERT concepts.",
    },
    {
      icon: <FaBookMedical />,
      question: "Can I take sectional tests for specific subjects?",
      answer:
        "Absolutely! We offer full-length mock tests as well as subject-wise tests (Physics, Chemistry, Botany, Zoology) and chapter-wise tests for targeted preparation.",
    },
    {
      icon: <GiBrain />,
      question: "How accurate is the AI-based performance analysis?",
      answer:
        "Our AI analysis is trained on data from thousands of top-performing NEET students. It identifies your weak areas with 95% accuracy and provides personalized improvement plans.",
    },
    {
      icon: <FaMoneyBillWave />,
      question: "Is there a free trial available?",
      answer:
        "Yes, we offer a 7-day free trial with access to 1 full-length mock test and 10 chapter-wise tests so you can experience our platform before subscribing.",
    },
    {
      icon: <FaKey />,
      question: "How do I reset my password?",
      answer:
        "Click on 'Forgot Password' on the login page, enter your registered email, and you'll receive a password reset link. The link expires in 24 hours for security.",
    },
    {
      icon: <FaTools />,
      question: "What if I face technical issues during a test?",
      answer:
        "Our platform auto-saves your progress every 30 seconds. If you face issues, you can resume from where you left off. For immediate assistance, use the 'Help' button or contact our 24/7 support team.",
    },
    {
      icon: <FaChartPie />,
      question: "Do you offer refunds?",
      answer:
        "We offer a 15-day money-back guarantee if you're not satisfied with our service. After completing your first mock test, if you feel it didn't meet your expectations, you can request a full refund.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F9FF] py-12 px-4">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-500 mt-2">
          Find answers to common questions about our NEET mock test platform
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="rounded-lg overflow-hidden shadow-sm">
            <button
              className={`w-full flex justify-between items-center px-6 py-4 rounded-lg transition-colors duration-300 ${
                activeIndex === index
                  ? "bg-[#007ACC] text-white"
                  : "bg-[#007ACC] text-white"
              }`}
              onClick={() => toggleAccordion(index)}
            >
              <div className="flex items-center space-x-3">
                <div className="text-xl">{faq.icon}</div>
                <span className="text-base md:text-lg text-md text-left font-medium text-white">
                  {faq.question}
                </span>
              </div>
              <svg
                className={`w-5 h-5 transform transition-transform duration-300 ${
                  activeIndex === index
                    ? "rotate-180 text-[#007ACC] bg-white h-8 w-8 rounded-full"
                    : "text-[#007ACC] bg-white h-8 w-8 rounded-full"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {activeIndex === index && (
              <div className="bg-white px-6 py-4 border-t text-gray-700">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
