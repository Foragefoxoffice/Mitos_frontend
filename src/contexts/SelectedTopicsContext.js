// contexts/SelectedTopicsContext.js
"use client"
import { createContext, useContext, useState } from "react";

const SelectedTopicsContext = createContext();

export const SelectedTopicsProvider = ({ children }) => {
  const [selectedTopics, setSelectedTopics] = useState([]);

  return (
    <SelectedTopicsContext.Provider value={{ selectedTopics, setSelectedTopics }}>
      {children}
    </SelectedTopicsContext.Provider>
  );
};

export const useSelectedTopics = () => useContext(SelectedTopicsContext);