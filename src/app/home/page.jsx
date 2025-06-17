"use client";

import {
  FaBookOpen,
  FaChartLine,
  FaShieldAlt,
  FaCheckCircle,
  FaUserGraduate,
  FaArrowRight,
  FaStar,
  FaMedal
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function LandingPage() {
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <main className="bg-white text-gray-800 overflow-hidden">
      {/* HERO */}
      <section 
        ref={heroRef}
        className="relative px-6 py-32 md:px-20 bg-gradient-to-br from-[#35095e] via-[#51216e] to-[#51216e] text-white text-center overflow-hidden"
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
          <div className="inline-flex items-center bg-indigo-700/30 px-4 py-2 rounded-full mb-6 border border-indigo-500/30">
            <FaMedal className="mr-2 text-white" />
            <span className="text-white">Trusted by 50,000+ NEET Aspirants</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-clip-text text-white bg-gradient-to-r ">
            Crack NEET with Smart Mock Tests
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-indigo-100">
            Practice. Analyze. Improve. Everything you need to master NEET 2025 is here.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/user/dashboard" 
              className="bg-white text-black px-8 py-4 text-lg rounded-full hover:bg-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-[#51216e]/30"
            >
              Start Free Mock Test <FaArrowRight />
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#features" 
              className="bg-transparent border-2 border-white/30 px-8 py-4 text-lg rounded-full hover:bg-white/10 font-medium flex items-center justify-center gap-2"
            >
              Learn More
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="bg-gray-50 text-white py-12">
        <div className="container mx-auto px-6 md:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50K+", label: "Students" },
              { value: "10K+", label: "Questions" },
              { value: "98%", label: "Accuracy" },
              { value: "24/7", label: "Support" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-4"
              >
                <div className="text-3xl text-[#51216e] md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-[#51216e]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" ref={featuresRef} className="px-6 py-20 md:px-20 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            What You'll Get
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600"
          >
            Our platform is designed to give you the competitive edge in NEET preparation
          </motion.p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <FaBookOpen size={36} />, title: "Chapterwise Tests", desc: "Based on updated NEET syllabus from NCERT.", color: "text-purple-500" },
            { icon: <FaChartLine size={36} />, title: "Performance Insights", desc: "Smart analytics with subject/topic breakdown.", color: "text-blue-500" },
            { icon: <FaShieldAlt size={36} />, title: "Verified Solutions", desc: "Curated questions with accurate keys.", color: "text-green-500" },
            { icon: <FaCheckCircle size={36} />, title: "Premium Unlocks", desc: "Access exclusive tricky MCQs & solutions.", color: "text-yellow-500" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-b from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <div className={`${feature.color} mb-6`}>{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-20 md:px-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Topper Stories</h2>
          <p className="text-lg text-gray-600">Hear from students who aced NEET with our platform</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { 
              name: "Riya", 
              score: "685", 
              text: "Helped me stay consistent and confident throughout my preparation journey.", 
              rating: 5 
            },
            { 
              name: "Mohit", 
              score: "671", 
              text: "Best mock test experience with real-time feedback and detailed solutions.", 
              rating: 5 
            },
            { 
              name: "Ayesha", 
              score: "659", 
              text: "Loved the smart reports after every test that showed exactly where to improve.", 
              rating: 4 
            }
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
                    className={starIndex < t.rating ? "text-yellow-400" : "text-gray-300"} 
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
                  <div className="text-sm text-gray-500">NEET Score: {t.score}/720</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20 md:px-20 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-gray-600">Get started in just 3 simple steps</p>
        </div>
        
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Take a Test", desc: "Choose from chapterwise or full-length mock tests" },
            { step: "2", title: "Get Analysis", desc: "Receive detailed performance breakdown with strengths & weaknesses" },
            { step: "3", title: "Improve", desc: "Focus on weak areas with personalized recommendations" }
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-8 rounded-xl border border-gray-200 relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 text-9xl font-bold text-gray-100 z-0">{step.step}</div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 md:px-20 bg-gradient-to-br from-indigo-900 to-purple-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Boost Your NEET Score?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Join thousands of students who trust us for NEET preparation.
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <a 
              href="/user/dashboard" 
              className="bg-white text-black px-8 py-4 text-lg rounded-full hover:bg-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/30"
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
              <div className="text-2xl font-bold text-white mb-4 md:mb-0">NEETMockApp</div>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white">Privacy</a>
                <a href="#" className="hover:text-white">Terms</a>
                <a href="#" className="hover:text-white">Contact</a>
              </div>
            </div>
            <p className="text-white" >© {new Date().getFullYear()} mitoslearning.com — All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}