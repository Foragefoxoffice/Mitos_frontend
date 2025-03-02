"use client";

import React, { useState, useEffect } from "react";
import { fetchCustomTestQuestions } from "@/utils/api";

export default function DummyPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const portionId = 1;
  const subjectId = 1;
  const chapterId = 1;
  const topicIds = [1, 2];
  const questionCount = 40;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await fetchCustomTestQuestions(
          portionId,
          subjectId,
          chapterId,
          topicIds,
          questionCount
        );
        setQuestions(data);
      } catch (error) {
        console.error("API Test Error:", error);
        setError(error.message || "Failed to fetch custom test questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <div>
      <h1>Test API Data</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>Error: {error}</p>
      ) : (
        <pre>{JSON.stringify(questions, null, 2)}</pre>
      )}
    </div>
  );
}