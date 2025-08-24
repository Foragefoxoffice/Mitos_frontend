// src/utils/api.js
import axios from "axios";

/** =======================
 *  AXIOS INSTANCE + CONFIG
 *  ======================= */
const API = axios.create({
  baseURL: "https://mitoslearning.in/api", // ← adjust if needed (e.g., http://localhost:5000/api/v1)
});
const REFRESH_URL = "/auth/refresh"; // ← adjust to your backend route

/** =======================
 *  STORAGE HELPERS (safe)
 *  ======================= */
const storage = {
  get accessToken() { try { return localStorage.getItem("token"); } catch { return null; } },
  set accessToken(v) { try { v ? localStorage.setItem("token", v) : localStorage.removeItem("token"); } catch {} },

  get refreshToken() { try { return localStorage.getItem("refreshToken"); } catch { return null; } },
  set refreshToken(v) { try { v ? localStorage.setItem("refreshToken", v) : localStorage.removeItem("refreshToken"); } catch {} },

  get userId() { try { return localStorage.getItem("userId"); } catch { return null; } },
  set userId(v) { try { v ? localStorage.setItem("userId", v) : localStorage.removeItem("userId"); } catch {} },

  get role() { try { return localStorage.getItem("role"); } catch { return null; } },
  set role(v) { try { v ? localStorage.setItem("role", v) : localStorage.removeItem("role"); } catch {} },
};

function setAuthHeader(token) {
  if (token) API.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete API.defaults.headers.common.Authorization;
}

/** =======================
 *  JWT HELPERS
 *  ======================= */
function parseJwt(token) {
  try {
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/") || "";
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch {
    return null;
  }
}
function isExpired(token) {
  const p = parseJwt(token);
  if (!p?.exp) return true;
  return Date.now() >= p.exp * 1000;
}

/** =======================
 *  PROACTIVE REFRESH TIMER
 *  ======================= */
let refreshTimer = null;
function clearRefreshTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}
function scheduleProactiveRefresh(accessToken) {
  clearRefreshTimer();
  const payload = parseJwt(accessToken);
  if (!payload?.exp) return;
  // Refresh ~60s before expiry (min 1s)
  const delay = Math.max(payload.exp * 1000 - Date.now() - 60_000, 1000);
  refreshTimer = setTimeout(() => {
    refreshAccessToken().catch(() => logout());
  }, delay);
}

/** =======================
 *  PUBLIC TOKEN APIS
 *  ======================= */
export function setTokens(accessToken, refreshToken, extra = {}) {
  storage.accessToken = accessToken || null;
  storage.refreshToken = refreshToken || null;
  if (extra.userId !== undefined) storage.userId = extra.userId;
  if (extra.role !== undefined) storage.role = extra.role;
  setAuthHeader(accessToken);
  if (accessToken) scheduleProactiveRefresh(accessToken);
}

export function logout() {
  clearRefreshTimer();
  storage.accessToken = null;
  storage.refreshToken = null;
  storage.userId = null;
  storage.role = null;
  setAuthHeader(null);
  try { window.location.assign("/login"); } catch {}
}

/** =======================
 *  SINGLE-FLIGHT REFRESH
 *  ======================= */
let refreshing = null;

async function callRefresh() {
  const rt = storage.refreshToken;
  if (!rt) throw new Error("No refresh token");

  // Use raw axios to avoid interceptor loops
  const res = await axios.post(`${API.defaults.baseURL}${REFRESH_URL}`, { refreshToken: rt });
  const newAT = res?.data?.accessToken;
  const newRT = res?.data?.refreshToken || rt; // rotate if server returns new
  if (!newAT) throw new Error("Refresh failed: no accessToken in response");

  setTokens(newAT, newRT);
  return newAT;
}

function refreshAccessToken() {
  if (!refreshing) {
    refreshing = callRefresh()
      .catch((e) => { logout(); throw e; })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

/** =======================
 *  INTERCEPTORS
 *  ======================= */
API.interceptors.request.use(
  (config) => {
    const t = storage.accessToken;
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// On 401/403 → refresh once → retry original request
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    if (!response) return Promise.reject(error);
    if (config.__isRetry) return Promise.reject(error);

    if (response.status === 401 || response.status === 403) {
      try {
        const newToken = await refreshAccessToken();
        config.__isRetry = true;
        config.headers.Authorization = `Bearer ${newToken}`;
        return API(config);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

/** =======================
 *  BOOTSTRAP ON APP LOAD
 *  ======================= */
export async function ensureAuthOnLoad() {
  const at = storage.accessToken;
  const rt = storage.refreshToken;

  if (at) setAuthHeader(at);

  if (!at && rt) {
    try { await refreshAccessToken(); } catch {/* logout already called on failure */}
    return;
  }

  if (at && isExpired(at)) {
    if (rt) {
      try { await refreshAccessToken(); } catch {}
    } else {
      logout();
    }
  } else if (at) {
    scheduleProactiveRefresh(at);
  }
}

/** =======================
 *  YOUR EXISTING API CALLS
 *  ======================= */

// Subjects / Portions
export const fetchSubjects = async () => {
  const { data } = await API.get("/subjects");
  return data;
};
export const fetchPortions = async () => {
  const { data } = await API.get("/portions");
  return data;
};
export const fetchSubjectsByPortions = async (portionId) => {
  const { data } = await API.get(`/subjects/subject/${portionId}`);
  return data;
};

// Chapters / Topics
export const fetchChaptersBySubject = async (subjectId) => {
  const { data } = await API.get(`/chapters/chapter/${subjectId}`);
  return data;
};
export const fetchChapter = async (chapterId) => {
  const { data } = await API.get(`/chapters/chapter/${chapterId}`);
  return data;
};
export const fetchChapterTopics = async (chapterId) => {
  const { data } = await API.get(`/topics/chapter/${chapterId}`);
  return data;
};
export const fetchTopicsWithPDF = (chapterId) =>
  API.get(`/pdf/chapters/${chapterId}/topics-with-topic-pdfs`);
export const fetchTopics = (chapterId) => API.get(`/topics/topic/${chapterId}`);
export const fetchQuestionType = () => API.get("/question-types");

// Questions
export const fetchQuestionBychapter = (chapterId) =>
  API.get(`/questions/chapter/${chapterId}`);
export const fetchQuestionByTopic = (topicId) =>
  API.get(`/questions/topic/${topicId}`);
export const fetchQuestionByType = (typeId) =>
  API.get(`/questions/topic/${typeId}`);

export const fetchQuestion = (topicId) =>
  API.get(`/questions?topicId=${topicId}`);

export const fetchQuestions = (topics) => {
  const topicIds = topics.join(",");
  return API.get(`/questions/topics?topicIds=${topicIds}`);
};

export const fetchQuestionsByTypes = (selectedQuestionTypes, chapterId) => {
  const questionTypeIds = selectedQuestionTypes.join(",");
  return API.get(
    `/questions/questiontype?questionTypeIds=${questionTypeIds}&chapterId=${chapterId}`
  );
};

export const getQuestionsBySubjectAndQuestionId = (subjectId, selectedQuestionTypes) =>
  API.get(
    `/questions/by-subject-and-id?subjectId=${subjectId}&questiontypeId=${selectedQuestionTypes}`
  );

export const getQuestionsBySubjectAndChapterId = (subjectId, chapterId) =>
  API.get(
    `/questions/by-subject-and-chapter-id?subjectId=${subjectId}&chapterId=${chapterId}`
  );

// Full test
export const fetchFullTestQuestion = () => API.get(`/questions/fulltest`);
export const fetchFullTestByPortion = (portionId) =>
  API.get(`/questions/portion/${portionId}`);
export const fetchFullTestBySubject = (portionId, subjectId) =>
  API.get(`/questions/portion/${portionId}/subject/${subjectId}`);
export const fetchFullTestByChapter = (portionId, subjectId, chapterId) =>
  API.get(`/questions/portion/${portionId}/subject/${subjectId}/chapter/${chapterId}`);

// ✅ Switched to axios so it benefits from auto-refresh
export const fetchCustomTestQuestions = async (portionId, chapterIds, questionLimit) => {
  const { data } = await API.post("/questions/custom", {
    portionId,
    chapterIds,
    questionLimit,
  });
  return data;
};

// Results / Leaderboard
export const fetchResultByUser = (userId) => API.get(`/tests/${userId}`);
export const fetchLeaderBoard = async () => {
  const { data } = await API.get(`/tests/leaders`);
  return data;
};

// Favorites
export const checkFavoriteStatus = async (userId) => {
  const { data } = await API.get(`/fav-questions?userId=${userId}`);
  return data;
};
export const addFavoriteQuestion = async (userId, questionId) => {
  const { data } = await API.post("/fav-questions", {
    userId: parseInt(userId, 10),
    questionId,
  });
  return data;
};
export const removeFavoriteQuestion = async (userId, questionId) => {
  const { data } = await API.delete("/fav-questions", {
    data: { userId: parseInt(userId, 10), questionId },
  });
  return data;
};

// Wrong-question reports
export const reportWrongQuestion = async (questionId, reason) => {
  const { data } = await API.post("/wrong-reports", { questionId, reason });
  return data;
};
export const getAllWrongQuestionReports = async () => {
  const { data } = await API.get("/wrong-reports");
  return data;
};
export const updateWrongQuestionReportStatus = async (id, status) => {
  const { data } = await API.patch(`/wrong-reports/${id}`, { status });
  return data;
};

// (Optional) Profile
export const getMe = () => API.get("/users/me");

export default API;
