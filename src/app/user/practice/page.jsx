"use client";

import { useState } from "react";
import Subject from "@/components/practice/subject";
import Chapter from "@/components/practice/chapter";
import TopicsPage from "@/components/practice/topics";
import QuestiontypePage from "@/components/practice/questiontype";
import Portion from "@/components/test/test-postion";
import TestSubject from "@/components/test/test-subject";
import TestChapter from "@/components/test/test-chapter";
import TestTopics from "@/components/test/test-topic";

// Custom Hook to Manage Tab State
const useTabState = (initialScreen) => {
  const [currentScreen, setCurrentScreen] = useState(initialScreen);
  const [selectedPortion, setSelectedPortion] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedQuestiontype, setSelectedQuestiontype] = useState(null);

  const handlePortionSelect = (portion) => {
    setSelectedPortion(portion);
    setCurrentScreen("test-subject");
  };

  const handleTestSubjectSelect = (subject, portion) => {
    setSelectedSubject(subject);
    setSelectedPortion(portion); // Ensure portion is saved
    setCurrentScreen("test-chapter");
  };

  const handleTestChapterSelect = (subject, portion, chapter) => {
    setSelectedSubject(subject);
    setSelectedSubject(chapter);
    setSelectedPortion(portion); // Ensure portion is saved
    setCurrentScreen("test-topic");
  };
  
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setCurrentScreen("chapter");
  };

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
    setCurrentScreen("topic");
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setCurrentScreen("questiontype");
  };

  const handleQuestiontypeSelect = (questiontype) => {
    setSelectedQuestiontype(questiontype);
  };

  const handleScreenSelection = (screen) => {
    setCurrentScreen(screen);
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
    handleTestChapterSelect
  };
};

export default function Practice() {
  const [activeTab, setActiveTab] = useState("tab1");

  // State for Practice Tab (Tab 1)
  const practiceState = useTabState("subject");

  // State for Test Tab (Tab 2)
  const testState = useTabState("full-portion");

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
            } px-4 py-2`}
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
    selectedPortion={testState.selectedPortion} // Pass selectedPortion here
    onChapterSelect={testState.handleChapterSelect}
    onScreenSelection={testState.handleScreenSelection}
  />
)}

            {testState.currentScreen === "test-topic" && (
              <TestTopics
              selectedSubject={testState.selectedSubject}
              selectedPortion={testState.selectedPortion} 
              selectedChapter={testState.selectedChapter} // Pass selectedPortion here
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
          <div className="p-4 text-center text-gray-500">
            Study Material feature is coming soon!
          </div>
        )}
      </div>
    </div>
  );
}
