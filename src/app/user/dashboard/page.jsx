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

/* ----------------------- small reusable components ----------------------- */

// Search
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

// Blocking modal to complete profile (mobile + class)
// Blocking modal to complete profile (mobile + class)
const ProfileCompletionModal = ({
  open,
  values,
  setValues,
  onSubmit,
  submitting,
  error,            // top-level/server error
  errors = {},      // NEW: field-level errors
  onValidate,       // NEW: live validation callback
}) => {
  if (!open) return null;

  const [touched, setTouched] = useState({
    phoneNumber: false,
    className: false,
  });

  const classOptions = [
    { label: "Select class…", value: "" },
    { label: "Class 11", value: "CLASS_11" },
    { label: "Class 12", value: "CLASS_12" },
    { label: "REPEATER", value: "REPEATER" },
  ];

  const phoneInvalid =
    !!errors.phoneNumber && (touched.phoneNumber || submitting);
  const classInvalid = !!errors.className && (touched.className || submitting);

  const setTouchedField = (k) =>
    setTouched((t) => ({ ...t, [k]: true }));

  const handlePhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setValues((v) => ({ ...v, phoneNumber: onlyDigits }));
    onValidate && onValidate({ ...values, phoneNumber: onlyDigits });
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, 10);
    setValues((v) => ({ ...v, phoneNumber: text }));
    setTouchedField("phoneNumber");
    onValidate && onValidate({ ...values, phoneNumber: text });
  };

  const handlePhoneKeyDown = (e) => {
    const allowed = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ];
    if (allowed.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  const handleClassChange = (e) => {
    const val = e.target.value;
    setValues((v) => ({ ...v, className: val }));
    onValidate && onValidate({ ...values, className: val });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[92%] max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-[#00497a] mb-1">
          Complete your profile
        </h3>
        <p className="text-sm text-[#4b6b86] mb-4">
          Please add your mobile number and class to continue.
        </p>

        <div className="space-y-4">
          {/* Phone */}
          <div>
            <label className="block text-sm text-[#00497a] mb-1" htmlFor="profile-phone">
              Mobile number (India)
            </label>
            <input
              id="profile-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile (starts with 6–9)"
              className={[
                "w-full rounded-lg px-3 py-2 text-black focus:outline-none",
                phoneInvalid
                  ? "border border-red-500 ring-1 ring-red-300 focus:ring-red-500"
                  : "border border-[#cfe9fb] focus:ring-2 focus:ring-[#007acc]",
              ].join(" ")}
              value={values.phoneNumber}
              onChange={handlePhoneChange}
              onBlur={() => setTouchedField("phoneNumber")}
              onPaste={handlePhonePaste}
              onKeyDown={handlePhoneKeyDown}
              aria-invalid={phoneInvalid ? "true" : "false"}
              aria-describedby={phoneInvalid ? "profile-phone-error" : undefined}
            />
            {phoneInvalid && (
              <p id="profile-phone-error" className="mt-1 text-xs text-red-600">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Class */}
          <div>
            <label className="block text-sm text-[#00497a] mb-1" htmlFor="profile-class">
              Class
            </label>
            <select
              id="profile-class"
              className={[
                "w-full rounded-lg px-3 py-2 bg-white text-black focus:outline-none",
                classInvalid
                  ? "border border-red-500 ring-1 ring-red-300 focus:ring-red-500"
                  : "border border-[#cfe9fb] focus:ring-2 focus:ring-[#007acc]",
              ].join(" ")}
              value={values.className}
              onChange={handleClassChange}
              onBlur={() => setTouchedField("className")}
              aria-invalid={classInvalid ? "true" : "false"}
              aria-describedby={classInvalid ? "profile-class-error" : undefined}
            >
              {classOptions.map((opt) => (
                <option key={opt.value || "empty"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {classInvalid && (
              <p id="profile-class-error" className="mt-1 text-xs text-red-600">
                {errors.className}
              </p>
            )}
          </div>

          {/* Server/top-level error */}
          {error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : null}

          <button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full bg-[#007ACC] text-white font-semibold rounded-lg py-2 hover:opacity-95 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save & continue"}
          </button>

          <p className="text-xs text-[#4b6b86] text-center">
            These details help us tailor your experience.
          </p>
        </div>
      </div>
    </div>
  );
};


/* ---------------------------- tab state helper --------------------------- */

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

/* --------------------------------- page --------------------------------- */

export default function Practice() {
  const [activeTab, setActiveTab] = useState("tab1");
  const [isLoading, setIsLoading] = useState(false);

  const practiceState = useTabState("practice", "subject");
  const testState = useTabState("test", "full-portion");
  const studyMaterialState = useTabState("study-material", "subject");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  // NEW: profile requirements
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileValues, setProfileValues] = useState({
    phoneNumber: "",
    className: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // per-tab search terms
  const [practiceSearch, setPracticeSearch] = useState("");
  const [testSearch, setTestSearch] = useState("");
  const [studySearch, setStudySearch] = useState("");
const [profileErrors, setProfileErrors] = useState({
  phoneNumber: "",
  className: "",
});

const validateProfile = (vals) => {
  const errors = { phoneNumber: "", className: "" };

  const phone = (vals.phoneNumber || "").replace(/\D/g, "");
  if (!phone) errors.phoneNumber = "Mobile number is required.";
  else if (!/^[6-9]\d{9}$/.test(phone)) {
    errors.phoneNumber =
      "Enter a valid Indian mobile (10 digits, starts with 6–9).";
  }

  const allowed = new Set(["CLASS_11", "CLASS_12", "REPEATER"]);
  if (!vals.className) errors.className = "Please select your class.";
  else if (!allowed.has(vals.className))
    errors.className = "Invalid class selected.";

  return { errors, isValid: !errors.phoneNumber && !errors.className };
};

  // Init active tab + logged-in
  useEffect(() => {
    const savedTab = sessionStorage.getItem("activeTab");
    if (savedTab) setActiveTab(savedTab);

    const userId =
      typeof window !== "undefined" && localStorage.getItem("userId");
    // treat presence of userId as logged-in
    setIsLoggedIn(!!userId);
  }, []);

  // Fetch user and enforce profile completion
  useEffect(() => {
    if (!isLoggedIn) return;

    const token =
      typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) return; // cannot fetch without token

    (async () => {
      try {
        const res = await fetch("https://mitoslearning.in/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user profile");
        const data = await res.json();
        const u = data?.user ?? data; // support either shape
        setUser(u);

        const phoneOk =
          !!u?.phoneNumber && String(u.phoneNumber).trim().length >= 10;
        const classOk = !!u?.className && String(u.className).trim().length > 0;

        // seed modal form with current values
        setProfileValues({
          phoneNumber: u?.phoneNumber ? String(u.phoneNumber).slice(0, 10) : "",
          className: u?.className ?? "",
        });

        // Block the page until completed
        setShowProfileModal(!(phoneOk && classOk));
      } catch (e) {
        // Silent fail: do not block if /me fails
        console.error(e);
      }
    })();
  }, [isLoggedIn]);

  // Reset search when screen changes (scoped feel)
  useEffect(() => setPracticeSearch(""), [practiceState.currentScreen]);
  useEffect(() => setTestSearch(""), [testState.currentScreen]);
  useEffect(() => setStudySearch(""), [studyMaterialState.currentScreen]);

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

  // helpers to know when to show Back + Search
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

const handleSaveProfile = async () => {
  setProfileError("");

  const { errors, isValid } = validateProfile(profileValues);
  setProfileErrors(errors);
  if (!isValid) {
    setShowProfileModal(true);
    setProfileError("Please fix the highlighted fields.");
    return;
  }
  if (!user?.id) {
    setProfileError("User not found. Please re-login.");
    return;
  }

  try {
    setSavingProfile(true);
    const token = localStorage.getItem("token");
    const phone = (profileValues.phoneNumber || "").replace(/\D/g, "");

    // 🔁 Map UI values -> Prisma enum values (adjust names to match your schema)
    const classMap = {
      "11": "CLASS_11",
      "12": "CLASS_12",
      "REPEATER": "REPEATER",
      // Fallback: if your schema uses plain "11" / "12", reverse this map or skip it
    };
    const normalizedClass =
      classMap[profileValues.className] || profileValues.className;

    const fd = new FormData();
    fd.append("phoneNumber", phone);
    fd.append("className", normalizedClass);

    const res = await fetch(
      `https://mitoslearning.in/api/users/update-profile/${user.id}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      }
    );

    if (!res.ok) {
      let serverMsg = "Failed to update profile";
      try {
        const data = await res.json();
        if (data?.errors) {
          setProfileErrors((prev) => ({ ...prev, ...data.errors }));
          serverMsg = "Please fix the highlighted fields.";
        } else if (data?.message) {
          serverMsg = String(data.message);
        }
      } catch {
        const t = await res.text().catch(() => "");
        if (t) serverMsg = t;
      }
      throw new Error(serverMsg);
    }

    setUser((u) => ({
      ...(u || {}),
      phoneNumber: phone,
      className: normalizedClass,
    }));
    setShowProfileModal(false);
  } catch (err) {
    setProfileError(err.message || "Something went wrong.");
  } finally {
    setSavingProfile(false);
  }
};



  return (
    <div className="pt-6">
      {/* Force profile completion (blocking) */}
    <ProfileCompletionModal
  open={isLoggedIn && showProfileModal}
  values={profileValues}
  setValues={setProfileValues}
  onSubmit={handleSaveProfile}
  submitting={savingProfile}
  error={profileError}
  errors={profileErrors}                                
  onValidate={(vals) => setProfileErrors(              
    validateProfile(vals).errors
  )}
/>

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
            <div
              className={
                showProfileModal ? "pointer-events-none opacity-40" : ""
              }
            >
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
                  searchTerm={practiceSearch}
                />
              )}
              {practiceState.currentScreen === "topic" && (
                <TopicsPage
                  selectedChapter={practiceState.selectedChapter}
                  onTopicSelect={practiceState.handleTopicSelect}
                  searchTerm={practiceSearch}
                />
              )}
              {practiceState.currentScreen === "questiontype" && (
                <QuestiontypePage
                  selectedTopic={practiceState.selectedTopic}
                  selectedChapter={practiceState.selectedChapter}
                  onQuestiontypeSelect={practiceState.handleQuestiontypeSelect}
                  searchTerm={practiceSearch}
                />
              )}
            </div>
          )}

          {/* TEST */}
          {activeTab === "tab2" && (
            <div
              className={
                showProfileModal ? "pointer-events-none opacity-40" : ""
              }
            >
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
                  searchTerm={testSearch}
                />
              )}
              {testState.currentScreen === "test-chapter" && (
                <TestChapter
                  selectedSubject={testState.selectedSubject}
                  selectedPortion={testState.selectedPortion}
                  onChapterSelect={testState.handleChapterSelect}
                  onScreenSelection={testState.handleScreenSelection}
                  searchTerm={testSearch}
                />
              )}
              {testState.currentScreen === "test-topic" && (
                <TestTopics
                  selectedSubject={testState.selectedSubject}
                  selectedPortion={testState.selectedPortion}
                  selectedChapter={testState.selectedChapter}
                  onTopicSelect={testState.handleTestChapterSelect}
                  onScreenSelection={testState.handleScreenSelection}
                  searchTerm={testSearch}
                />
              )}
              {testState.currentScreen === "questiontype" && (
                <QuestiontypePage
                  selectedTopic={testState.selectedTopic}
                  selectedChapter={testState.selectedChapter}
                  onQuestiontypeSelect={testState.handleQuestiontypeSelect}
                  searchTerm={testSearch}
                />
              )}
            </div>
          )}

          {/* STUDY MATERIAL */}
          {activeTab === "tab3" && (
            <div
              className={
                showProfileModal ? "pointer-events-none opacity-40" : ""
              }
            >
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
                  searchTerm={studySearch}
                />
              )}
              {studyMaterialState.currentScreen === "topic" && (
                <MeterialsTopicsPage
                  selectedChapter={studyMaterialState.selectedChapter}
                  onTopicSelect={studyMaterialState.handleTopicSelect}
                  searchTerm={studySearch}
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
