"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, MapPin } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
  }),
};

export default function About() {
  return (
    <div className="min-h-screen text-gray-800">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
        className="py-12 text-center px-6"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700">
          About Us - Mitos Learning
        </h1>
        <p className="mt-2 max-w-3xl mx-auto text-lg text-gray-600">
          Mitos Learning is a Tamil Nadu–based educational technology platform dedicated to
          helping students prepare for the NEET (National Eligibility cum Entrance Test).
        </p>
      </motion.section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-8 px-8 items-stretch">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
        >
          <div className="h-full rounded-2xl shadow-lg border-0 bg-white/90 backdrop-blur-sm p-6">
            <h2 className="text-2xl font-bold text-blue-700">Our Mission</h2>
            <p className="mt-3 text-gray-700">
              To empower every NEET aspirant whether in a city or a small town with
              accessible, effective, and affordable test preparation tools. We want to remove
              barriers so that motivated students can achieve their medical college dreams.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={2}
        >
          <div className="h-full rounded-2xl shadow-lg border-0 bg-white/90 backdrop-blur-sm p-6">
            <h2 className="text-2xl font-bold text-blue-700">Our Vision</h2>
            <p className="mt-3 text-gray-700">
              To become India’s most trusted and effective NEET preparation partner blending
              technology, analytics, and expert content to make success achievable for every
              student.
            </p>
          </div>
        </motion.div>
      </section>

      {/* What We Offer */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={3}
        className="px-6 md:px-20 py-16"
      >
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-10">
          What We Offer
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {[
            {
              title: "Practice Tests & Question Bank",
              desc: "Thousands of NEET-style questions with detailed solutions.",
            },
            {
              title: "Smart Analytics",
              desc: "Track your progress, identify weak areas, and improve faster.",
            },
            {
              title: "Easy Access",
              desc: "Free login using Google Sign-In — quick, secure, and reliable.",
            },
            {
              title: "Supportive Community",
              desc: "Tips, guidance, and future features to connect with peers and mentors.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
            >
              <div className="h-full rounded-2xl border-0 shadow-md hover:shadow-lg transition bg-white p-6">
                <h3 className="text-xl font-semibold text-blue-600">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Our Approach */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={4}
        className="px-6 md:px-20"
      >
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-10">
          Our Approach
        </h2>
        <div className="grid md:grid-cols-3 gap-6 items-stretch mx-auto">
          {[
            {
              title: "Student-Centered",
              desc: "We design every feature to help you learn efficiently and confidently.",
            },
            {
              title: "Data Privacy",
              desc: "We collect only the essential information needed to personalize your learning.",
            },
            {
              title: "Continuous Improvement",
              desc: "We listen to feedback and constantly improve our content and technology.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="h-full bg-white shadow rounded-xl p-5 hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-blue-600 ">{item.title}</h3>
              <p className="text-gray-600 mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Contact Us */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={5}
        className="px-6 md:px-20 py-16 bg-[linear-gradient(179.62deg,#007acc_23.91%,#003d66_112.47%)] rounded-2xl mt-16 text-white text-center"
      >
        <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
        <div className="flex flex-col items-center gap-4">
          <p className="flex items-center gap-2 text-white">
            <MapPin /> 13/1-116, Mettur, Salem, Tamil Nadu – 636403
          </p>
          <p className="flex items-center gap-2 text-white">
            <Mail /> <a href="mailto:support@mitoslearning.in">support@mitoslearning.in</a>
          </p>
        </div>
      </motion.section>
    </div>
  );
}
