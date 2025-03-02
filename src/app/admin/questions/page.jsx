"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import react-select and react-transition-group with SSR disabled
const Select = dynamic(() => import("react-select"), { ssr: false });
const CSSTransition = dynamic(() => import("react-transition-group").then((mod) => mod.CSSTransition), { ssr: false });

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const router = useRouter();
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  // Fetch filters (topics, subjects, chapters, question types) from the API
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        if (!token) {
          throw new Error("Token is missing");
        }

        const topicRes = await axios.get("http://localhost:5000/api/topics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTopics(topicRes.data.map((t) => ({ value: t.id, label: t.name })));

        const subjectRes = await axios.get("http://localhost:5000/api/subjects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubjects(subjectRes.data.map((s) => ({ value: s.id, label: s.name })));

        const chapterRes = await axios.get("http://localhost:5000/api/chapters", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChapters(chapterRes.data.map((c) => ({ value: c.id, label: c.name })));

        const questionTypeRes = await axios.get("http://localhost:5000/api/question-types", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuestionTypes(questionTypeRes.data.map((qt) => ({ value: qt.id, label: qt.name })));
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, [token]);

  // Fetch questions based on selected filters
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        if (!token) {
          throw new Error("Token is missing");
        }

        let url = "http://localhost:5000/api/questions/";
        const filterParams = [];

        if (selectedTopic) filterParams.push(`topic/${selectedTopic}`);
        if (selectedSubject) filterParams.push(`subject/${selectedSubject}`);
        if (selectedChapter) filterParams.push(`chapter/${selectedChapter}`);
        if (selectedQuestionType) filterParams.push(`questionType/${selectedQuestionType}`);

        if (filterParams.length > 0) {
          url += filterParams.join("&");
        }

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            topicId: selectedTopic,
            subjectId: selectedSubject,
            chapterId: selectedChapter,
            questionTypesId: selectedQuestionType,
          },
        });

        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedTopic, selectedSubject, selectedChapter, selectedQuestionType, token]);

  return (
    <div className="py-10">
      {/* Filters */}
      <div className="mb-6">
        <CSSTransition in={true} timeout={500} classNames="fade" unmountOnExit>
          <div className="mb-4">
            <Select
              options={topics}
              value={selectedTopic ? { value: selectedTopic, label: topics.find((t) => t.value === selectedTopic)?.label } : null}
              onChange={(selectedOption) => setSelectedTopic(selectedOption?.value ?? null)}
              placeholder="Select Topic"
              isClearable
            />
          </div>
        </CSSTransition>
        <CSSTransition in={true} timeout={500} classNames="fade" unmountOnExit>
          <div className="mb-4">
            <Select
              options={subjects}
              value={selectedSubject ? { value: selectedSubject, label: subjects.find((s) => s.value === selectedSubject)?.label } : null}
              onChange={(selectedOption) => setSelectedSubject(selectedOption?.value ?? null)}
              placeholder="Select Subject"
              isClearable
            />
          </div>
        </CSSTransition>
        <CSSTransition in={true} timeout={500} classNames="fade" unmountOnExit>
          <div className="mb-4">
            <Select
              options={chapters}
              value={selectedChapter ? { value: selectedChapter, label: chapters.find((c) => c.value === selectedChapter)?.label } : null}
              onChange={(selectedOption) => setSelectedChapter(selectedOption?.value ?? null)}
              placeholder="Select Chapter"
              isClearable
            />
          </div>
        </CSSTransition>
        <CSSTransition in={true} timeout={500} classNames="fade" unmountOnExit>
          <div className="mb-4">
            <Select
              options={questionTypes}
              value={selectedQuestionType ? { value: selectedQuestionType, label: questionTypes.find((qt) => qt.value === selectedQuestionType)?.label } : null}
              onChange={(selectedOption) => setSelectedQuestionType(selectedOption?.value ?? null)}
              placeholder="Select Question Type"
              isClearable
            />
          </div>
        </CSSTransition>
      </div>

      {/* Display Questions */}
      {loading ? (
        <p>Loading questions...</p>
      ) : (
        <div>
          {questions.length > 0 ? (
            <ul>
              {questions.map((question) => (
                <li key={question.id} className="mb-4 p-4 border">
                  <h3 className="font-bold">{question.questionText}</h3>
                </li>
              ))}
            </ul>
          ) : (
            <p>No questions available.</p>
          )}
        </div>
      )}
    </div>
  );
}