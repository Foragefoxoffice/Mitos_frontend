// contexts/SelectedQuestionTypesContext.js
"use client";
import { createContext, useContext, useState } from "react";

const SelectedQuestionTypesContext = createContext();

export const SelectedQuestionTypesProvider = ({ children }) => {
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState([]);
  const [chapterId, setChapterId] = useState(null);

  return (
    <SelectedQuestionTypesContext.Provider
      value={{ selectedQuestionTypes, setSelectedQuestionTypes, chapterId, setChapterId }}
    >
      {children}
    </SelectedQuestionTypesContext.Provider>
  );
};

export const useSelectedQuestionTypes = () => useContext(SelectedQuestionTypesContext);