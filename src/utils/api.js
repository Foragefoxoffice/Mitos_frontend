import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API call for fetching subjects
export const fetchSubjects = async () => {
  try {
    const { data } = await API.get("/subjects"); // Directly return the data
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error; // Propagate the error to the calling function
  }
};

export const fetchPortions = async () => {
  try {
    const { data } = await API.get("/portions"); // Directly return the data
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error; // Propagate the error to the calling function
  }
};

export const fetchSubjectsByPortions = async (portionId) => {
  try {
    const response = await API.get(`/subjects/subject/${portionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chapter:", error);
    throw error;
  }
};
export const fetchChaptersBySubject = async (subjectId) => {
  try {
    const response = await API.get(`/chapters/chapter/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chapter:", error);
    throw error;
  }
};
export const fetchChapter = async (subjectId) => {
  try {
    const response = await API.get(`/chapters/chapter/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chapter:", error);
    throw error;
  }
};
export const fetchChapterTopics = async (chapterId) => {
  try {
    const response = await API.get(`/topics/chapter/${chapterId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chapter:", error);
    throw error;
  }
};
export const fetchTopics = (chapterId) => API.get(`/topics/topic/${chapterId}`);
export const fetchQuestionType = () => API.get("/question-types");
export const fetchQuestion = (topicId) => API.get(`/questions?topicId=${topicId}`);
export const fetchQuestions = (topics) => {
  const topicIds = topics.join(","); // Ensure topics are serialized correctly
  return API.get(`/questions/topics?topicIds=${topicIds}`); // Use 'topicIds' here
};
export const fetchQuestionsByTypes = (selectedQuestionTypes, chapterId) => {
  const questionTypeIds = selectedQuestionTypes.join(","); // Ensure topics are serialized correctly
  return API.get(`/questions/questiontype?questionTypeIds=${questionTypeIds}&chapterId=${chapterId}`); // Use 'topicIds' here
};

export const fetchFullTestQuestion = () => API.get(`/questions/fulltest`);

export const fetchFullTestByPortion = (portionId) => API.get(`/questions/portion/${portionId}`);

export const fetchFullTestBySubject = (portionId, subjectId) => API.get(`/questions/portion/${portionId}/subject/${subjectId}`);

export const fetchFullTestByChapter = (portionId, subjectId,chapterId) => API.get(`/questions/portion/${portionId}/subject/${subjectId}/chapter/${chapterId}`);

export const fetchCustomTestQuestions = async (
  portionId,
  subjectId,
  chapterId,
  topicIds,
  questionCount
) => {

  const token = localStorage.getItem("token"); // Retrieve the token from localStorage

  if (!token) {
    throw new Error("No token found. Please log in.");
  }
  const response = await fetch("http://localhost:5000/api/questions/custom", {
    
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
    body: JSON.stringify({
      portionId,
      subjectId,
      chapterId,
      topicIds,
      questionCount,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json(); // Parse the error response
    throw new Error(errorData.message || "Failed to fetch custom test questions");
  }

  return response.json();
};

export const fetchResultByUser = (userId) => API.get(`/tests/${userId}`);

export const fetchLeaderBoard = async () => {
  try {
    const { data } = await API.get(`/tests/a`); // Use correct endpoint
    return data; // Directly return data
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

export default API;
