"use client";

import {
  FaBookOpen,
  FaChartLine,
  FaShieldAlt,
  FaCheckCircle,
  FaUserGraduate,
  FaArrowRight,
  FaStar,
  FaMedal,
  FaGift,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ChartComparison from "./ChartComparison";
import {
  FaQuestionCircle,
  FaSlidersH,
  FaLightbulb,
  FaInfinity,
  FaClipboardList,
  FaUserCircle,
  FaChartBar,
  FaFlagCheckered,
} from "react-icons/fa";

export default function LandingPage() {
  const chartData = [
    { label: "Week 1", withMitos: 8, withoutMitos: 6 },
    { label: "Week 2", withMitos: 22, withoutMitos: 9 },
    { label: "Week 3", withMitos: 24, withoutMitos: 5 },
    { label: "Week 4", withMitos: 30, withoutMitos: 7 },
    { label: "Week 5", withMitos: 36, withoutMitos: 10 },
    { label: "Week 6", withMitos: 32, withoutMitos: 8 },
    { label: "Week 7", withMitos: 41, withoutMitos: 12 },
    { label: "Week 8", withMitos: 60, withoutMitos: 9 },
  ];

  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: FaQuestionCircle,
      title: "30,000+ Questions",
      desc: "30000+ Line by Line NCERT based questions with NCERT reference modeled on past NEET question papers.",
      accent: "bg-amber-100 text-amber-600",
    },
    {
      icon: FaSlidersH,
      title: "Customizable question practice",
      desc: "Customizable topic-wise practice for all chapters and 10+ question types for each topic.",
      accent: "bg-violet-100 text-violet-600",
    },
    {
      icon: FaLightbulb,
      title: "30+ Years Previous Year Questions",
      desc: "Past 30+ years PYQ with solutions.",
      accent: "bg-lime-100 text-lime-600",
    },
    {
      icon: FaInfinity,
      title: "Unlimited Test",
      desc: "Unlimited full-portion tests and unlimited customisable chapter tests.",
      accent: "bg-sky-100 text-sky-600",
    },
    {
      icon: FaClipboardList,
      title: "Subject-wise Test",
      desc: "Detailed subject-wise and question type-wise report of mistakes in each test.",
      accent: "bg-teal-100 text-teal-600",
    },
    {
      icon: FaUserCircle,
      title: "Personal data driven score booster",
      desc: "Personalised, data-driven error analytics and score booster for weak areas.",
      accent: "bg-pink-100 text-pink-600",
    },
    {
      icon: FaChartBar,
      title: "Indepth analytics",
      desc: "Analytics on weak subjects, weak question types, and subject-wise weekly accuracy trends.",
      accent: "bg-orange-100 text-orange-600",
    },
    {
      icon: FaFlagCheckered,
      title: "Key Features",
      desc: "Topic-wise HD study material, leaderboard to know where you stand, NEET updates & more.",
      accent: "bg-rose-100 text-rose-600",
    },
  ];

  return (
    <main className="bg-white text-gray-800 overflow-hidden mt-3 ">
      {/* header */}
      <section className="bg-white md:mr-16 md:ml-16 mr-2 ml-2 md:mb-2 mb-4">
        <div className="mx-auto md:flex block items-center justify-between gap-4 px-5 py-3">
          {/* Logo */}
          <div className="flex justify-center md:mb-0 mb-3">
            <a href="/">
              <img
                src="images/practice/header-logo.png"
                alt="MITOS LEARNING"
                className="md:w-[60%] w-[50%]"
              />
            </a>
          </div>

          {/* CTA Button */}
          <a
            href="/user/dashboard"
            className="flex items-center gap-2 rounded-full border border-purple-600 text-[#6F3195] font-semibold px-5 py-3 bg-gradient-to-b from-purple-600/10 to-purple-600/5 shadow-[inset_0_0_0_1px_rgba(122,42,239,0.12)] transition-all hover:bg-purple-600 hover:text-white hover:shadow-[0_6px_18px_rgba(122,42,239,0.25)] active:translate-y-[1px] whitespace-nowrap md:whitespace-normal"
          >
            Start your NEET success now
            <svg
              viewBox="0 0 24 24"
              className="w-[18px] h-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      {/* HERO */}
      <section
        style={{
          backgroundImage:
            "linear-gradient(105.92deg, #4F1F6D 0.93%, #BF5FFA 134.75%)",
          borderRadius: "50px",
        }}
        ref={heroRef}
        className="relative px-6 py-12 md:py-32 md:px-20 text-white text-center overflow-hidden md:mr-16 md:ml-16 mr-2 ml-2"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center bg-[#4A2588] px-4 py-2 rounded-full mb-6 border border-[#7B4EC7]">
            <FaMedal className="mr-2 text-white" />
            <span className="text-white text-left md:text-center">
              Trusted by 10,000+ NEET Aspirants
            </span>
          </div>
          <h1
            style={{ lineHeight: 1.25 }}
            className="text-2xl md:text-6xl font-bold mb-3 md:mb-6 leading-tight bg-clip-text text-white bg-gradient-to-r "
          >
            Do you need to be top 1%
            <br className="br-tag" />
            in NEET Toppers?
          </h1>
          <p className="text-md md:text-2xl font-medium mb-8 max-w-2xl mx-auto text-white">
            Master NEET with limitless practice, tests, study guides,
            <br className="br-tag" />
            data-driven personal analytics, and more.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/user/dashboard"
              className="bg-white whitespace-nowrap md:whitespace-normal text-[#6F3195] px-8 py-4 text-lg rounded-full hover:bg-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-[#51216e]/30"
            >
              Click your way into 650+ in NEET <FaArrowRight />
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* STATS */}
      {/* <section className="bg-gray-50 text-white py-12">
        <div className="container mx-auto px-6 md:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50K+", label: "Students" },
              { value: "10K+", label: "Questions" },
              { value: "98%", label: "Accuracy" },
              { value: "24/7", label: "Support" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-4"
              >
                <div className="text-3xl text-[#51216e] md:text-4xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-[#51216e]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* FEATURES */}
      <section
        id="features"
        ref={featuresRef}
        className="px-6 py-10 md:py-20 md:px-20 bg-white md:mr-16 md:ml-16 mr-2 ml-2"
      >
        <div className="max-w-4xl mx-auto text-center md:mb-16 mb-6">
          <motion.h2
            style={{ fontWeight: 800 }}
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl mb-4 bg-gradient-to-r from-[#2f1042] to-[#bf6af4] bg-clip-text text-transparent"
          >
            What You'll Get
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-[#2D2D2D] font-medium"
          >
            Our platform is designed to give you the competitive
            <br className="br-tag" /> edge in NEET preparation
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map(({ icon: Icon, title, desc, accent }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-[#B887C1] bg-[#FEF8FF] p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-black/5 ${accent}`}
              >
                <Icon size={22} />
              </div>

              <h3 className="text-[18px] font-semibold text-gray-900 leading-snug">
                {title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparision */}

      <section className="Comparision md:mr-16 md:ml-16 mr-2 ml-2">
        <div className="rounded-[32px] bg-purple-50 px-2 py-10 md:px-32 md:py-24">
          {/* Title */}
          <div className="text-center">
            <motion.h2
              style={{ fontWeight: 800 }}
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl mb-4 bg-gradient-to-r from-[#2f1042] to-[#bf6af4] bg-clip-text text-transparent"
            >
              Why Choose Us?
            </motion.h2>
          </div>

          {/* Table */}
          <div className="md:mt-16 mt-6 md:overflow-hidden rounded-3xl md:border md:border-gray-200 bg-white shadow-sm border-[#fff]">
            <table className="w-full md:table-fixed table-auto">
              <colgroup>
                <col className="w-[42%]" />
                <col className="w-[29%]" />
                <col className="w-[29%]" />
              </colgroup>

              <thead>
                <tr className="bg-[#6D3093] text-white">
                  <th className="md:py-5 md:px-4 py-2 px-2 text text-xl font-semibold md:text-end text-center"></th>
                  <th className="md:py-5 md:px-4 py-2 px-2 text-center text-xl border-l border-[#fff] font-semibold">
                    Mitos learning
                  </th>
                  <th className="py-5 text-center pl-4 pr-6 border-l border-[#fff] text-xl font-semibold">
                    Others
                  </th>
                </tr>
              </thead>

              <tbody className="text-[#000000] text-sm">
                <tr className=" border-gray-200 text-center">
                  <td className="md:py-5 py-2 md:pl-6 md:pr-4 pl-2 pr-2 font-medium text-[#000000] border border-[#e0e0e0]">
                    Line by line NCERT Questions
                  </td>
                  <td className="py-5 px-4 font-bold text-lg text-[#fff] bg-[#6d3093] border border-[#e0e0e0]">
                    30000+
                  </td>
                  <td className="border border-[#e0e0e0] md:py-5 py-2 md:pl-6 md:pr-4 pl-2 pr-2 font-medium text-[#000000]">
                    less than 15000
                  </td>
                </tr>

                <tr className="border-t text-center">
                  <td className="border border-[#e0e0e0] md:py-5 py-2 md:pl-6 md:pr-4 pl-2 pr-2 font-medium text-[#000000]">
                    Practice question based on question types
                  </td>
                  <td className="py-5 border border-[#e0e0e0] px-4 font-bold text-lg text-[#fff] bg-[#6d3093]">
                    Yes
                  </td>
                  <td className="border border-[#e0e0e0] md:py-5 py-2 md:pl-6 md:pr-4 pl-2 pr-2 font-medium text-[#000000]">
                    No
                  </td>
                </tr>

                <tr className="border-t text-center">
                  <td className="border border-[#e0e0e0] md:py-5 py-2 md:pl-6 md:pr-4 pl-2 pr-2 font-medium text-[#000000]">
                    Customizable practice for weak
                    <br className="hidden md:block" />
                    chapters &amp; question types
                  </td>
                  <td className="py-5 border border-[#e0e0e0] px-4 font-bold text-lg text-[#fff] bg-[#6d3093]">
                    Yes
                  </td>
                  <td className="border border-[#e0e0e0] md:py-5 py-2 md:pl-6 md:pr-4 pl-2 pr-2 font-medium text-[#000000]">
                    No
                  </td>
                </tr>

                <tr className="border-t text-center">
                  <td className="border border-[#e0e0e0] md:py-5 py-2 md:pl-6 md:pr-4 pl-2 pr-2 font-medium text-[#000000]">
                    Subject wise weekly accuracy Trend
                  </td>
                  <td className="py-5 border border-[#e0e0e0] px-4 font-bold text-lg text-[#fff] bg-[#6d3093]">
                    Yes
                  </td>
                  <td className="border border-[#e0e0e0] md:py-5 py-2 md:pl-6 md:pr-4 pl-2 pr-2 font-medium text-[#000000]">
                    No
                  </td>
                </tr>
               
                <tr className="border-t text-center">
                  <td className="border border-[#e0e0e0] md:py-5 py-2 md:pl-6 md:pr-4 pl-2 pr-2 font-medium text-[#000000]">
                    NEET Score Predictor
                  </td>
                  <td className="py-5 border border-[#e0e0e0] px-4 font-bold text-lg text-[#fff] bg-[#6d3093]">
                    Yes
                  </td>
                  <td className="border border-[#e0e0e0] md:py-5 py-2 md:pl-6 md:pr-4 pl-2 pr-2 font-medium text-[#000000]">
                    No
                  </td>
                </tr>
                  <tr className="border-t text-center">
                  <td className="border border-[#e0e0e0] md:py-5 py-2 md:pl-6 md:pr-4 pl-2 pr-2 font-medium text-[#000000]">
                   Biology questions framed even from Unit preface and Chapter summary
                  </td>
                  <td className="py-5 border border-[#e0e0e0] px-4 font-bold text-lg text-[#fff] bg-[#6d3093]">
                    Yes
                  </td>
                  <td className="border border-[#e0e0e0] md:py-5 py-2 md:pl-6 md:pr-4 pl-2 pr-2 font-medium text-[#000000]">
                    No
                  </td>
                </tr>
                <tr className="border-t text-center">
                  <td className="border border-[#e0e0e0] md:py-5 py-2 md:pl-6 md:pr-4 pl-2 pr-2 font-medium text-[#000000]">
                    Unlimited customised test with
                    <br className="hidden md:block" />
                    error analysis
                  </td>
                  <td className="py-5 border border-[#e0e0e0] px-4 font-bold text-lg text-[#fff] bg-[#6d3093]">
                    Yes
                  </td>
                  <td className="border border-[#e0e0e0] md:py-5 py-2 md:pl-6 md:pr-4 pl-2 pr-2 font-medium text-[#000000]">
                    very rarely
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-[#6d3093]/90 rounded-2xl  mt-6 flex justify-center items-center gap-4">
            <FaGift className="text-white" />
            <p className="text-center text-white text-lg">
              Bonus Exercise: NCERT Exemplar, Solved Excercise, Short, long and
              very long questions
            </p>
          </div>
        </div>
      </section>

      {/* chart */}

      <section className="chart md:py-20 py-6">
        <ChartComparison title="" data={chartData} live={true} />
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-10 md:py-28 md:px-20 bg-[#FAF1FF] mt-10 md:mt-0">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2
            style={{ fontWeight: 800 }}
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl mb-4 bg-gradient-to-r from-[#2f1042] to-[#bf6af4] bg-clip-text text-transparent"
          >
            Topper Stories
          </motion.h2>

          <p className="text-lg text-[#2D2D2D] font-medium">
            Hear from students who aced NEET with our platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: "Riya",
              score: "685",
              text: "Helped me stay consistent and confident throughout my preparation journey.",
              rating: 5,
            },
            {
              name: "Mohit",
              score: "671",
              text: "Best mock test experience with real-time feedback and detailed solutions.",
              rating: 5,
            },
            {
              name: "Ayesha",
              score: "659",
              text: "Loved the smart reports after every test that showed exactly where to improve.",
              rating: 4,
            },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, starIndex) => (
                  <FaStar
                    key={starIndex}
                    className={
                      starIndex < t.rating ? "text-yellow-400" : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <p className="italic mb-6 text-gray-700">"{t.text}"</p>
              <div className="flex items-center">
                <div className="bg-indigo-100 text-indigo-800 w-12 h-12 rounded-full flex items-center justify-center font-bold mr-4">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{t.name}</div>
                  {/* <div className="text-sm text-gray-500">
                    NEET Score: {t.score}/720
                  </div> */}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-10 md:py-28 md:px-10 bg-white">
        <div className="max-w-4xl mx-auto text-center md:mb-16 mb-6">
          <motion.h2
            style={{ fontWeight: 800 }}
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl mb-4 bg-gradient-to-r from-[#2f1042] to-[#bf6af4] bg-clip-text text-transparent"
          >
            How It Works
          </motion.h2>
          <p className="text-lg text-[#2D2D2D] font-medium">
            Get started in just 3 simple steps
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Take a Test",
              desc: "Choose from chapterwise or full-length mock tests",
            },
            {
              step: "2",
              title: "Get Analysis",
              desc: "Receive detailed performance breakdown with strengths & weaknesses",
            },
            {
              step: "3",
              title: "Improve",
              desc: "Focus on weak areas with personalized recommendations",
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-8 rounded-xl border border-gray-200 relative overflow-hidden"
            >
              <div
                style={{ opacity: 0.2 }}
                className="absolute -top-4 -right-4 text-9xl font-bold text-[#3C0047] z-0"
              >
                {step.step}
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-10 md:py-20 md:px-20 bg-[#6D3093] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-6">
            Ready to boost your NEET <br className="br-tag" />
            Preparation effectively
          </h2>
          <p className="text-xl mb-8 text-[#fff] font-medium">
            Join thousands of students who trust us for NEET preparation.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <a
              href="/user/dashboard"
              className="bg-white text-[#6F3195] px-8 py-4 text-lg rounded-full hover:bg-white font-medium flex items-center justify-center gap-2 shadow-lg"
            >
              Start Practicing Now <FaArrowRight />
            </a>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-sm text-center py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-6 md:px-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div className="text-2xl font-bold text-white mb-4 md:mb-0">
                <img
                  src="images/practice/header-logo.png"
                  alt="MITOS LEARNING"
                  className="md:w-[60%] w-[50%]"
                />
              </div>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white">
                  Privacy
                </a>
                <a href="#" className="hover:text-white">
                  Terms
                </a>
                <a href="#" className="hover:text-white">
                  Contact
                </a>
              </div>
            </div>
            <p className="text-white">
              © {new Date().getFullYear()} mitoslearning.com — All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
