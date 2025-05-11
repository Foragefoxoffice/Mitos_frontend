"use client";

import { useState } from "react";
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

// Custom Hook to Manage Tab State
const useTabState = (initialScreen) => {
  const [currentScreen, setCurrentScreen] = useState(initialScreen);
  const [selectedPortion, setSelectedPortion] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedQuestiontype, setSelectedQuestiontype] = useState(null);
  const [history, setHistory] = useState([initialScreen]); // History stack

  const navigateTo = (screen) => {
    setHistory((prevHistory) => [...prevHistory, screen]); // Add new screen to history
    setCurrentScreen(screen); // Update current screen
  };

  const goBack = () => {
    setHistory((prevHistory) => {
      if (prevHistory.length > 1) {
        const newHistory = prevHistory.slice(0, -1); // Remove last screen
        const previousScreen = newHistory[newHistory.length - 1]; // Get last screen
        setCurrentScreen(previousScreen); // Update screen immediately
        return newHistory;
      }
      return prevHistory;
    });
  };

  const handlePortionSelect = (portion) => {
    setSelectedPortion(portion);
    navigateTo("test-subject");
  };

  const handleTestSubjectSelect = (subject, portion) => {
    setSelectedSubject(subject);
    setSelectedPortion(portion);
    navigateTo("test-chapter");
  };

  const handleTestChapterSelect = (subject, portion, chapter) => {
    setSelectedSubject(subject);
    setSelectedChapter(chapter);
    setSelectedPortion(portion);
    navigateTo("test-topic");
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    navigateTo("chapter");
  };

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
    navigateTo("topic");
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    navigateTo("questiontype");
  };

  const handleQuestiontypeSelect = (questiontype) => {
    setSelectedQuestiontype(questiontype);
  };

  const handleScreenSelection = (screen) => {
    navigateTo(screen);
  };

  return {
    currentScreen,
    selectedPortion,
    selectedSubject,
    selectedChapter,
    selectedTopic,
    selectedQuestiontype,
    handlePortionSelect,
    handleSubjectSelect,
    handleChapterSelect,
    handleTopicSelect,
    handleQuestiontypeSelect,
    handleScreenSelection,
    handleTestSubjectSelect,
    handleTestChapterSelect,
    goBack,
  };
};

export default function Practice() {
  const [activeTab, setActiveTab] = useState("tab1");

  // State for Practice Tab (Tab 1)
  const practiceState = useTabState("subject");

  // State for Test Tab (Tab 2)
  const testState = useTabState("full-portion");

  // State for Study Material Tab (Tab 3)
  const studyMaterialState = useTabState("subject");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="py-6">
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
            aria-label={`${
              tab === "tab1"
                ? "Practice"
                : tab === "tab2"
                ? "Test"
                : "Study Material"
            } Tab`}
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

      {/* Tab Content */}
      <div className="mt-4">
        {/* Practice Tab (Tab 1) */}
        {activeTab === "tab1" && (
          <div>
            {["chapter", "topic", "questiontype"].includes(practiceState.currentScreen) && (
              <button onClick={practiceState.goBack} className="flex items-center p-2 rounded-md ml-4">
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

        {/* Test Tab (Tab 2) */}
        {activeTab === "tab2" && (
          <div>
            {["test-subject", "test-chapter", 'test-topic','questiontype'].includes(testState.currentScreen) && (
              <button onClick={testState.goBack} className="flex items-center p-2 rounded-md ml-4">
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

        {/* Study Material Tab (Tab 3) */}
        {activeTab === "tab3" && (
          <div>
            {["chapter", "topic"].includes(studyMaterialState.currentScreen) && (
              <button onClick={studyMaterialState.goBack} className="flex items-center p-2 rounded-md ml-4">
                <FaAngleLeft className="text-xl text-white" />
                <span className="text-white">Back</span> 
              </button>
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
    </div>
  );
}