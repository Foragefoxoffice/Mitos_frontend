import { createContext, useContext, useState } from "react";

const SelectedQuestionTypesContext = createContext();

export const SelectedQuestionTypesProvider = ({ children }) => {
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState([]);
  const [chapterId, setChapterId] = useState(null);
  const [subject, setSubject] = useState("");
  const [subjectId, setSubjectId] = useState(null); // ✅ Add this

  return (
    <SelectedQuestionTypesContext.Provider
      value={{
        selectedQuestionTypes,
        setSelectedQuestionTypes,
        chapterId,
        setChapterId,
        subject,
        setSubject,
        subjectId,
        setSubjectId, // ✅ Add this
      }}
    >
      {children}
    </SelectedQuestionTypesContext.Provider>
  );
};

export const useSelectedQuestionTypes = () => useContext(SelectedQuestionTypesContext);
