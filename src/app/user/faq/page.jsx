"use client";
import { useState } from 'react';
import Head from 'next/head';
import { FaQuestionCircle, FaBookMedical, FaMobileAlt, FaSyncAlt, 
         FaLightbulb, FaChartPie, FaRegMoneyBillAlt, FaKey, 
         FaTools, FaMoneyBillWave, FaHeadset } from 'react-icons/fa';
import { RiTestTubeFill } from 'react-icons/ri';
import { GiBrain } from 'react-icons/gi';

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      icon: <FaQuestionCircle className="text-[#35095E] text-xl mr-4" />,
      question: "What is this NEET mock test platform?",
      answer: "Our platform provides high-quality mock tests designed to simulate the actual NEET exam experience. We offer comprehensive question banks, detailed performance analytics, and personalized feedback to help students prepare effectively."
    },
    {
      icon: <RiTestTubeFill className="text-[#35095E] text-xl mr-4" />,
      question: "How are your mock tests different from others?",
      answer: "Our tests are created by NEET experts and follow the latest NTA pattern strictly. We provide: 1) Detailed solutions with explanations, 2) Performance comparison with toppers, 3) Adaptive test recommendations, and 4) Real-time exam interface simulation."
    },
    {
      icon: <FaRegMoneyBillAlt className="text-[#35095E] text-xl mr-4" />,
      question: "What payment options are available?",
      answer: "We accept all major credit/debit cards, UPI payments, net banking, and popular digital wallets. We also offer EMI options for some subscription plans."
    },
    {
      icon: <FaMobileAlt className="text-[#35095E] text-xl mr-4" />,
      question: "Can I access the tests on mobile devices?",
      answer: "Yes, our platform is fully responsive and works on smartphones, tablets, and desktops. We recommend using our dedicated mobile app for the best experience."
    },
    {
      icon: <FaSyncAlt className="text-[#35095E] text-xl mr-4" />,
      question: "How often are new mock tests added?",
      answer: "We add new full-length mock tests every week and update our question bank daily with new questions based on recent trends and analysis."
    },
    {
      icon: <FaLightbulb className="text-[#35095E] text-xl mr-4" />,
      question: "Do you provide solutions for the questions?",
      answer: "Yes, every question comes with a detailed solution that includes explanations, diagrams where needed, and references to NCERT concepts."
    },
    {
      icon: <FaBookMedical className="text-[#35095E] text-xl mr-4" />,
      question: "Can I take sectional tests for specific subjects?",
      answer: "Absolutely! We offer full-length mock tests as well as subject-wise tests (Physics, Chemistry, Botany, Zoology) and chapter-wise tests for targeted preparation."
    },
    {
      icon: <GiBrain className="text-[#35095E] text-xl mr-4" />,
      question: "How accurate is the AI-based performance analysis?",
      answer: "Our AI analysis is trained on data from thousands of top-performing NEET students. It identifies your weak areas with 95% accuracy and provides personalized improvement plans."
    },
    {
      icon: <FaMoneyBillWave className="text-[#35095E] text-xl mr-4" />,
      question: "Is there a free trial available?",
      answer: "Yes, we offer a 7-day free trial with access to 1 full-length mock test and 10 chapter-wise tests so you can experience our platform before subscribing."
    },
    {
      icon: <FaKey className="text-[#35095E] text-xl mr-4" />,
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page, enter your registered email, and you'll receive a password reset link. The link expires in 24 hours for security."
    },
    {
      icon: <FaTools className="text-[#35095E] text-xl mr-4" />,
      question: "What if I face technical issues during a test?",
      answer: "Our platform auto-saves your progress every 30 seconds. If you face issues, you can resume from where you left off. For immediate assistance, use the 'Help' button or contact our 24/7 support team."
    },
    {
      icon: <FaChartPie className="text-[#35095E] text-xl mr-4" />,
      question: "Do you offer refunds?",
      answer: "We offer a 15-day money-back guarantee if you're not satisfied with our service. After completing your first mock test, if you feel it didn't meet your expectations, you can request a full refund."
    }
  ];

  return (
    <div className="min-h-screen ">
      <Head>
        <title>NEET Mock Test Platform - FAQs</title>
        <meta name="description" content="Frequently asked questions about our NEET mock test platform" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#35095E]">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">Find answers to common questions about our NEET mock test platform</p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <button
                className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none"
                onClick={() => toggleAccordion(index)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {faq.icon}
                    <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                  </div>
                  <svg
                    className={`w-5 h-5 text-[#35095E] transform transition-transform duration-200 ${activeIndex === index ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {activeIndex === index && (
                <div className="px-6 py-4 bg-gray-50 pl-14">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Still have questions?</h2>
          <p className="text-lg text-gray-600 mb-6">Contact our support team for further assistance</p>
          <button className="bg-[#35095E] hover:bg-[#6712b7] text-white font-medium py-3 px-8 rounded-lg shadow-md transition-colors duration-200 flex items-center mx-auto">
            <FaHeadset className="mr-2" />
            Contact Support
          </button>
        </div>
      </main>
    </div>
  );
}