// nav.js
"use client";

import { useState, useEffect } from "react";
import Subject from "@/components/practice/subject";
import Chapter from "@/components/practice/chapter";
import TopicsPage from "@/components/practice/topics";
import MeterialsSubject from "@/components/study-material/subject";
import MeterialsChapter from "@/components/study-material/chapter";
import MeterialsTopicsPage from "@/components/study-material/topics";
import QuestiontypePage from "@/components/practice/questiontype";
import Portion from "@/components/test/test-postion";
import TestSubject from "@/components/test/test-subject";
import TestChapter from "@/components/test/test-chapter";
import TestTopics from "@/components/test/test-topic";
import CommonLoader from "@/commonLoader";
import { TbBulb } from "react-icons/tb";
import { LuNotebookPen } from "react-icons/lu";
import { RiBook2Line } from "react-icons/ri";
import { HiArrowSmallLeft } from "react-icons/hi2";
import { FiSearch, FiX } from "react-icons/fi";
import PremiumPopup from "@/components/PremiumPopup";

// ---------- Small UI piece just for the search ----------
const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="relative w-full max-w-xs md:max-w-md">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#007acc]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 rounded-lg border border-[#cfe9fb] focus:outline-none focus:ring-2 focus:ring-[#007acc] text-[#00497a]"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label="Clear search"
        >
          <FiX className="text-[#4b6b86] bg-[#fff]" />
        </button>
      ) : null}
    </div>
  );
};

// ---------- Tab state hook (unchanged logic) ----------
const useTabState = (tabKey, initialScreen) => {
  const sessionKey = `tabState-${tabKey}`;

  const getInitialState = () => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved) return JSON.parse(saved);
    }
    return {
      currentScreen: initialScreen,
      selectedPortion: null,
      selectedSubject: null,
      selectedChapter: null,
      selectedTopic: null,
      selectedQuestiontype: null,
      history: [initialScreen],
    };
  };

  const [state, setState] = useState(getInitialState);

  useEffect(() => {
    sessionStorage.setItem(sessionKey, JSON.stringify(state));
  }, [state]);

  const update = (updates) => setState((prev) => ({ ...prev, ...updates }));

  const navigateTo = (screen) => {
    update({
      history: [...state.history, screen],
      currentScreen: screen,
    });
  };

  const goBack = () => {
    if (state.history.length > 1) {
      const newHistory = state.history.slice(0, -1);
      const previousScreen = newHistory[newHistory.length - 1];
      update({ history: newHistory, currentScreen: previousScreen });
    }
  };

  return {
    ...state,
    goBack,
    navigateTo,
    handlePortionSelect: (portion) => (
      update({ selectedPortion: portion }), navigateTo("test-subject")
    ),
    handleTestSubjectSelect: (subject, portion) => (
      update({ selectedSubject: subject, selectedPortion: portion }),
      navigateTo("test-chapter")
    ),
    handleTestChapterSelect: (subject, portion, chapter) => (
      update({
        selectedSubject: subject,
        selectedPortion: portion,
        selectedChapter: chapter,
      }),
      navigateTo("test-topic")
    ),
    handleSubjectSelect: (subject) => (
      update({ selectedSubject: subject }), navigateTo("chapter")
    ),
    handleChapterSelect: (chapter) => (
      update({ selectedChapter: chapter }), navigateTo("topic")
    ),
    handleTopicSelect: (topic) => (
      update({ selectedTopic: topic }), navigateTo("questiontype")
    ),
    handleQuestiontypeSelect: (questiontype) =>
      update({ selectedQuestiontype: questiontype }),
    handleScreenSelection: (screen) => navigateTo(screen),
  };
};

export default function Practice() {
  const [activeTab, setActiveTab] = useState("tab1");
  const [isLoading, setIsLoading] = useState(false);

  const practiceState = useTabState("practice", "subject");
  const testState = useTabState("test", "full-portion");
  const studyMaterialState = useTabState("study-material", "subject");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  // NEW: per-tab search terms (filtered only where Back shows)
  const [practiceSearch, setPracticeSearch] = useState("");
  const [testSearch, setTestSearch] = useState("");
  const [studySearch, setStudySearch] = useState("");

  useEffect(() => {
    const savedTab = sessionStorage.getItem("activeTab");
    if (savedTab) setActiveTab(savedTab);

    const userId =
      typeof window !== "undefined" && localStorage.getItem("userId");
    setIsLoggedIn(!!userId);
  }, []);

  // Reset search when screen changes (so it feels scoped to that screen)
  useEffect(() => {
    setPracticeSearch("");
  }, [practiceState.currentScreen]);

  useEffect(() => {
    setTestSearch("");
  }, [testState.currentScreen]);

  useEffect(() => {
    setStudySearch("");
  }, [studyMaterialState.currentScreen]);

  const tabDetails = {
    tab1: {
      label: "Practice",
      icon: <TbBulb className="inline md:mr-2 mr-1" />,
    },
    tab2: {
      label: "Test",
      icon: <LuNotebookPen className="inline md:mr-2 mr-1" />,
    },
    tab3: {
      label: "Study Material",
      icon: <RiBook2Line className="inline md:mr-2 mr-1" />,
    },
  };

  const handleTabClick = (tab) => {
    if (tab === "tab3" && !isLoggedIn) {
      setShowPremiumPopup(true);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      sessionStorage.setItem("activeTab", tab);
      setIsLoading(false);

      if (tab === "tab1") practiceState.navigateTo("subject");
      else if (tab === "tab2") testState.navigateTo("full-portion");
      else if (tab === "tab3") studyMaterialState.navigateTo("subject");
    }, 50);
  };

  // helpers to know when to show Back + Search (scoped to same places)
  const showPracticeHeader = ["chapter", "topic", "questiontype"].includes(
    practiceState.currentScreen
  );
  const showTestHeader = [
    "test-subject",
    "test-chapter",
    "test-topic",
    "questiontype",
  ].includes(testState.currentScreen);
  const showStudyHeader = ["chapter", "topic"].includes(
    studyMaterialState.currentScreen
  );

  return (
    <div className="pt-6">
      {/* Tabs */}
      <div className="tabs flex space-x-3 md:space-x-4">
        {["tab1", "tab2", "tab3"].map((tab) => (
          <button
            key={tab}
            className={`tab ${
              activeTab === tab
                ? "bg-[#007ACC] text-white font-bold rounded-5xl text-[--text]"
                : "text-[#00497A]"
            } px-2 md:px-9 md:py-3 py-2`}
            onClick={() => handleTabClick(tab)}
            aria-label={tabDetails[tab]?.label || "Tab"}
            aria-selected={activeTab === tab}
          >
            <span
              className={`flex items-center transition-all duration-300 ease-in-out ${
                tab === activeTab
                  ? "text-white md:text-[18px] text-[13px]"
                  : "text-[#00497a] md:text-[16px] text-[14px]"
              }`}
            >
              {tabDetails[tab]?.icon}
              <span
                className={`flex items-center transition-all duration-300 ease-in-out ${
                  tab === activeTab
                    ? "text-white md:text-[18px] text-[13px]"
                    : "text-[#00497a] md:text-[16px] text-[14px]"
                }`}
              >
                {tabDetails[tab]?.label ?? "Unknown Tab"}
              </span>
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <CommonLoader />
      ) : (
        <div className="mt-4">
          {/* PRACTICE */}
          {activeTab === "tab1" && (
            <div>
              {showPracticeHeader && (
                <div className="flex justify-between items-center gap-3 md:gap-4 px-4 mb-3">
                  <button
                    onClick={practiceState.goBack}
                    className="flex items-center p-2 rounded-md bg-transparent"
                  >
                    <HiArrowSmallLeft className="text-xl text-[#007acc]" />
                    <span className="text-[#007acc] ml-1">Back</span>
                  </button>
                  <SearchBar
                    value={practiceSearch}
                    onChange={setPracticeSearch}
                    placeholder={
                      practiceState.currentScreen === "chapter"
                        ? "Search chapters..."
                        : practiceState.currentScreen === "topic"
                        ? "Search topics..."
                        : "Search types..."
                    }
                  />
                </div>
              )}

              {practiceState.currentScreen === "subject" && (
                <Subject
                  onSubjectSelect={practiceState.handleSubjectSelect}
                  onScreenSelection={practiceState.handleScreenSelection}
                />
              )}
              {practiceState.currentScreen === "chapter" && (
                <Chapter
                  selectedSubject={practiceState.selectedSubject}
                  selectedPortion={practiceState.selectedPortion}
                  onChapterSelect={practiceState.handleChapterSelect}
                  onScreenSelection={practiceState.handleScreenSelection}
                  searchTerm={practiceSearch} // NEW
                />
              )}
              {practiceState.currentScreen === "topic" && (
                <TopicsPage
                  selectedChapter={practiceState.selectedChapter}
                  onTopicSelect={practiceState.handleTopicSelect}
                  searchTerm={practiceSearch} // NEW
                />
              )}
              {practiceState.currentScreen === "questiontype" && (
                <QuestiontypePage
                  selectedTopic={practiceState.selectedTopic}
                  selectedChapter={practiceState.selectedChapter}
                  onQuestiontypeSelect={practiceState.handleQuestiontypeSelect}
                  searchTerm={practiceSearch} // NEW
                />
              )}
            </div>
          )}

          {/* TEST */}
          {activeTab === "tab2" && (
            <div>
              {showTestHeader && (
                <div className="flex justify-between items-center gap-3 md:gap-4 px-4 mb-3">
                  <button
                    onClick={testState.goBack}
                    className="flex items-center p-2 rounded-md bg-transparent"
                  >
                    <HiArrowSmallLeft className="text-xl text-[#007acc]" />
                    <span className="text-[#007acc] ml-1">Back</span>
                  </button>
                  <SearchBar
                    value={testSearch}
                    onChange={setTestSearch}
                    placeholder={
                      testState.currentScreen === "test-subject"
                        ? "Search subjects..."
                        : testState.currentScreen === "test-chapter"
                        ? "Search chapters..."
                        : testState.currentScreen === "test-topic"
                        ? "Search topics..."
                        : "Search types..."
                    }
                  />
                </div>
              )}

              {testState.currentScreen === "full-portion" && (
                <Portion
                  onPortionSelect={testState.handlePortionSelect}
                  onScreenSelection={testState.handleScreenSelection}
                />
              )}
              {testState.currentScreen === "test-subject" && (
                <TestSubject
                  selectedPortion={testState.selectedPortion}
                  onSubjectSelect={testState.handleTestSubjectSelect}
                  onScreenSelection={testState.handleScreenSelection}
                  searchTerm={testSearch} // NEW
                />
              )}
              {testState.currentScreen === "test-chapter" && (
                <TestChapter
                  selectedSubject={testState.selectedSubject}
                  selectedPortion={testState.selectedPortion}
                  onChapterSelect={testState.handleChapterSelect}
                  onScreenSelection={testState.handleScreenSelection}
                  searchTerm={testSearch} // NEW
                />
              )}
              {testState.currentScreen === "test-topic" && (
                <TestTopics
                  selectedSubject={testState.selectedSubject}
                  selectedPortion={testState.selectedPortion}
                  selectedChapter={testState.selectedChapter}
                  onTopicSelect={testState.handleTestChapterSelect}
                  onScreenSelection={testState.handleScreenSelection}
                  searchTerm={testSearch} // NEW
                />
              )}
              {testState.currentScreen === "questiontype" && (
                <QuestiontypePage
                  selectedTopic={testState.selectedTopic}
                  selectedChapter={testState.selectedChapter}
                  onQuestiontypeSelect={testState.handleQuestiontypeSelect}
                  searchTerm={testSearch} // NEW
                />
              )}
            </div>
          )}

          {/* STUDY MATERIAL */}
          {activeTab === "tab3" && (
            <div>
              {showStudyHeader && (
                <div className="flex items-center justify-between gap-3 md:gap-4 px-4 mb-3">
                  <button
                    className="flex bg-transparent items-center p-2 rounded-md"
                    onClick={studyMaterialState.goBack}
                  >
                    <HiArrowSmallLeft className="text-xl text-[#007acc]" />
                    <span className="text-[#007acc] ml-1">Back</span>
                  </button>
                  <SearchBar
                    value={studySearch}
                    onChange={setStudySearch}
                    placeholder={
                      studyMaterialState.currentScreen === "chapter"
                        ? "Search chapters..."
                        : "Search topics..."
                    }
                  />
                </div>
              )}

              {studyMaterialState.currentScreen === "subject" && (
                <MeterialsSubject
                  onSubjectSelect={studyMaterialState.handleSubjectSelect}
                  onScreenSelection={studyMaterialState.handleScreenSelection}
                />
              )}
              {studyMaterialState.currentScreen === "chapter" && (
                <MeterialsChapter
                  selectedSubject={studyMaterialState.selectedSubject}
                  onChapterSelect={studyMaterialState.handleChapterSelect}
                  onScreenSelection={studyMaterialState.handleScreenSelection}
                  searchTerm={studySearch} // NEW
                />
              )}
              {studyMaterialState.currentScreen === "topic" && (
                <MeterialsTopicsPage
                  selectedChapter={studyMaterialState.selectedChapter}
                  onTopicSelect={studyMaterialState.handleTopicSelect}
                  searchTerm={studySearch} // NEW
                />
              )}
            </div>
          )}
        </div>
      )}

      {showPremiumPopup && (
        <PremiumPopup onClose={() => setShowPremiumPopup(false)} />
      )}
    </div>
  );
}
