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
import { FaAngleLeft } from "react-icons/fa6";
import CommonLoader from "@/commonLoader";

// Custom Hook for Tab State with SessionStorage Persistence
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

  const update = (updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

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
      update({
        history: newHistory,
        currentScreen: previousScreen,
      });
    }
  };

  return {
    ...state,
    goBack,
    navigateTo,
    handlePortionSelect: (portion) =>
      update({ selectedPortion: portion }) || navigateTo("test-subject"),

    handleTestSubjectSelect: (subject, portion) =>
      update({ selectedSubject: subject, selectedPortion: portion }) ||
      navigateTo("test-chapter"),

    handleTestChapterSelect: (subject, portion, chapter) =>
      update({
        selectedSubject: subject,
        selectedPortion: portion,
        selectedChapter: chapter,
      }) || navigateTo("test-topic"),

    handleSubjectSelect: (subject) =>
      update({ selectedSubject: subject }) || navigateTo("chapter"),

    handleChapterSelect: (chapter) =>
      update({ selectedChapter: chapter }) || navigateTo("topic"),

    handleTopicSelect: (topic) =>
      update({ selectedTopic: topic }) || navigateTo("questiontype"),

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

  useEffect(() => {
    const savedTab = sessionStorage.getItem("activeTab");
    if (savedTab) setActiveTab(savedTab);
  }, []);

  const handleTabClick = (tab) => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      sessionStorage.setItem("activeTab", tab);
      setIsLoading(false);

      // Reset state to first screen on tab change
      if (tab === "tab1") {
        practiceState.navigateTo("subject");
      } else if (tab === "tab2") {
        testState.navigateTo("full-portion");
      } else if (tab === "tab3") {
        studyMaterialState.navigateTo("subject");
      }
    }, 50);
  };

  return (
    <div className="pt-6">
      {/* Tab Buttons */}
      <div className="tabs flex space-x-4">
        {["tab1", "tab2", "tab3"].map((tab, index) => (
          <button
            key={index}
            className={`tab ${
              activeTab === tab
                ? "bg-[#EBD7FF] rounded-3xl text-[--text]"
                : "text-gray-500"
            } px-4 md:px-6 py-2`}
            onClick={() => handleTabClick(tab)}
            aria-label={
              tab === "tab1"
                ? "Practice"
                : tab === "tab2"
                ? "Test"
                : "Study Material"
            }
            aria-selected={activeTab === tab}
          >
            {tab === "tab1"
              ? "Practice"
              : tab === "tab2"
              ? "Test"
              : "Study Material"}
          </button>
        ))}
      </div>

      {isLoading ? (
          <CommonLoader />

      ) : (
        <div className="mt-4">
          {/* Practice Tab */}
          {activeTab === "tab1" && (
            <div>
              {["chapter", "topic", "questiontype"].includes(
                practiceState.currentScreen
              ) && (
                <button
                  onClick={practiceState.goBack}
                  className="flex items-center p-2 rounded-md ml-4"
                >
                  <FaAngleLeft className="text-xl text-white" />
                  <span className="text-white">Back</span>
                </button>
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
                />
              )}
              {practiceState.currentScreen === "topic" && (
                <TopicsPage
                  selectedChapter={practiceState.selectedChapter}
                  onTopicSelect={practiceState.handleTopicSelect}
                />
              )}
              {practiceState.currentScreen === "questiontype" && (
                <QuestiontypePage
                  selectedTopic={practiceState.selectedTopic}
                  selectedChapter={practiceState.selectedChapter}
                  onQuestiontypeSelect={practiceState.handleQuestiontypeSelect}
                />
              )}
            </div>
          )}

          {/* Test Tab */}
          {activeTab === "tab2" && (
            <div>
              {[
                "test-subject",
                "test-chapter",
                "test-topic",
                "questiontype",
              ].includes(testState.currentScreen) && (
                <button
                  onClick={testState.goBack}
                  className="flex items-center p-2 rounded-md ml-4"
                >
                  <FaAngleLeft className="text-xl text-white" />
                  <span className="text-white">Back</span>
                </button>
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
                />
              )}
              {testState.currentScreen === "test-chapter" && (
                <TestChapter
                  selectedSubject={testState.selectedSubject}
                  selectedPortion={testState.selectedPortion}
                  onChapterSelect={testState.handleChapterSelect}
                  onScreenSelection={testState.handleScreenSelection}
                />
              )}
              {testState.currentScreen === "test-topic" && (
                <TestTopics
                  selectedSubject={testState.selectedSubject}
                  selectedPortion={testState.selectedPortion}
                  selectedChapter={testState.selectedChapter}
                  onTopicSelect={testState.handleTestChapterSelect}
                  onScreenSelection={testState.handleScreenSelection}
                />
              )}
              {testState.currentScreen === "questiontype" && (
                <QuestiontypePage
                  selectedTopic={testState.selectedTopic}
                  selectedChapter={testState.selectedChapter}
                  onQuestiontypeSelect={testState.handleQuestiontypeSelect}
                />
              )}
            </div>
          )}

          {/* Study Material Tab */}
          {activeTab === "tab3" && (
            <div>
              {["chapter", "topic"].includes(
                studyMaterialState.currentScreen
              ) && (
                <div className="flex items-center">
                  <button
                    onClick={studyMaterialState.goBack}
                    className="flex items-center p-2 rounded-md ml-4"
                  >
                    <FaAngleLeft className="text-xl text-white" />
                  </button>
                  <h2 className="pl-2 text-2xl font-semibold capitalize text-[#35095E]">
                    {studyMaterialState.currentScreen === "chapter"
                      ? "Learn by Chapter"
                      : "Learn By Topic"}
                  </h2>
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
                />
              )}
              {studyMaterialState.currentScreen === "topic" && (
                <MeterialsTopicsPage
                  selectedChapter={studyMaterialState.selectedChapter}
                  onTopicSelect={studyMaterialState.handleTopicSelect}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
