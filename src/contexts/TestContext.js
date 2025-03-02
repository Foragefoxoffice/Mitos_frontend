"use client";

import React, { createContext, useState } from "react";

export const TestContext = createContext();

export const TestProvider = ({ children }) => {
  const [testData, setTestData] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]); // <-- Added this

  return (
    <TestContext.Provider value={{ testData, setTestData, selectedTopics, setSelectedTopics }}>
      {children}
    </TestContext.Provider>
  );
};
