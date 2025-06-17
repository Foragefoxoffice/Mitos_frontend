import axios from "axios";

const API = axios.create({
  baseURL: "https://mitoslearning.in/api",
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
export const fetchChapter = async (chapterId) => {
  try {
    const response = await API.get(`/chapters/chapter/${chapterId}`);
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

export const fetchQuestionBychapter = (chapterId) => API.get(`/questions/chapter/${chapterId}`);
export const fetchQuestionByTopic = (topicId) => API.get(`/questions/topic/${topicId}`);
export const fetchQuestionByType = (typeId) => API.get(`/questions/topic/${typeId}`);

export const fetchQuestion = (topicId) => API.get(`/questions?topicId=${topicId}`);
export const fetchQuestions = (topics) => {
  const topicIds = topics.join(","); // Ensure topics are serialized correctly
  return API.get(`/questions/topics?topicIds=${topicIds}`); // Use 'topicIds' here
};
export const fetchQuestionsByTypes = (selectedQuestionTypes, chapterId) => {
  const questionTypeIds = selectedQuestionTypes.join(","); // Ensure topics are serialized correctly
  return API.get(`/questions/questiontype?questionTypeIds=${questionTypeIds}&chapterId=${chapterId}`); // Use 'topicIds' here
};

export const getQuestionsBySubjectAndQuestionId = (subjectId, selectedQuestionTypes) => {
  return API.get(`/questions/by-subject-and-id?subjectId=${subjectId}&questiontypeId=${selectedQuestionTypes}`);
};

export const getQuestionsBySubjectAndChapterId = (subjectId, chapterId) => {
  return API.get(`/questions/by-subject-and-chapter-id?subjectId=${subjectId}&chapterId=${chapterId}`);
};

export const fetchFullTestQuestion = () => API.get(`/questions/fulltest`);

export const fetchFullTestByPortion = (portionId) => API.get(`/questions/portion/${portionId}`);

export const fetchFullTestBySubject = (portionId, subjectId) => API.get(`/questions/portion/${portionId}/subject/${subjectId}`);

export const fetchFullTestByChapter = (portionId, subjectId,chapterId) => API.get(`/questions/portion/${portionId}/subject/${subjectId}/chapter/${chapterId}`);

export const fetchCustomTestQuestions = async (
  portionId,
  chapterIds,
  questionLimit
) => {

  const token = localStorage.getItem("token"); // Retrieve the token from localStorage

  if (!token) {
    throw new Error("No token found. Please log in.");
  }
  const response = await fetch("https://mitoslearning.in/api/questions/custom", {
    
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
    body: JSON.stringify({
      portionId,
      chapterIds,
      questionLimit,
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
    const { data } = await API.get(`/tests/leaders`); // Use correct endpoint
    return data; // Directly return data
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

// Favorite Questions APIs
export const checkFavoriteStatus = async (userId) => {
  try {
    const { data } = await API.get(`/fav-questions?userId=${userId}`);
    return data;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    throw error;
  }
};

export const addFavoriteQuestion = async (userId, questionId) => {
  try {
    const { data } = await API.post("/fav-questions", {
      userId: parseInt(userId, 10),
      questionId
    });
    return data;
  } catch (error) {
    console.error("Error adding favorite question:", error);
    throw error;
  }
};

export const removeFavoriteQuestion = async (userId, questionId) => {
  try {
    const { data } = await API.delete("/fav-questions", {
      data: {
        userId: parseInt(userId, 10),
        questionId
      }
    });
    return data;
  } catch (error) {
    console.error("Error removing favorite question:", error);
    throw error;
  }
};


export default API;
