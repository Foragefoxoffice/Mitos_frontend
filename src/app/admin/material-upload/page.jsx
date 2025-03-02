"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function UploadPDF() {
  const [file, setFile] = useState(null);
  const [portionId, setPortionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [topicName, setTopicName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [portions, setPortions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [token, setToken] = useState(null);

  // Fetch token from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  // Fetch portions from the API
  useEffect(() => {
    const fetchPortions = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/portions");
        setPortions(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching portions:", error);
        setPortions([]);
      }
    };
    fetchPortions();
  }, []);

  // Fetch subjects based on portionId
  useEffect(() => {
    if (!portionId) return setSubjects([]);

    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/subjects/subject/${portionId}`);
        setSubjects(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [portionId]);

  // Fetch chapters based on subjectId
  useEffect(() => {
    if (!subjectId) return setChapters([]);

    const fetchChapters = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/chapters/chapter/${subjectId}`);
        setChapters(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching chapters:", error);
        setChapters([]);
      }
    };
    fetchChapters();
  }, [subjectId]);

  // Fetch topics based on chapterId
  useEffect(() => {
    if (!chapterId) return setTopics([]);

    const fetchTopics = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/topics/topic/${chapterId}`);
        setTopics(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching topics:", error);
        setTopics([]);
      }
    };
    fetchTopics();
  }, [chapterId]);

  // Handle topic selection
  const handleTopicChange = (event) => {
    const selectedTopicId = event.target.value;
    setTopicId(selectedTopicId);
    const selectedTopic = topics.find((topic) => topic.id.toString() === selectedTopicId);
    setTopicName(selectedTopic ? selectedTopic.name : "");
    console.log("Selected Topic Name:", selectedTopic ? selectedTopic.name : "None");
  };

  // Handle file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    console.log("Uploading with topic name:", topicName);

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("portionId", portionId);
    formData.append("subjectId", subjectId);
    formData.append("chapterId", chapterId);
    formData.append("topicId", topicId);
    formData.append("name", topicName);

    try {
      setUploading(true);
      setMessage("");
      setProgress(0);

      if (!token) {
        setMessage("Authentication error: Please log in again.");
        setUploading(false);
        return;
      }

      const response = await axios.post("http://localhost:5000/api/pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
      });

      setMessage("File uploaded successfully!");
      setFile(null);
      setPortionId("");
      setSubjectId("");
      setChapterId("");
      setTopicId("");
      setTopicName("");
    } catch (error) {
      console.error("Upload failed:", error);
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">Upload PDF</h2>
        <select className="w-full border p-2 mb-2" value={portionId} onChange={(e) => setPortionId(e.target.value)}>
          <option value="">Select Portion</option>
          {portions.map((portion) => (
            <option key={portion.id} value={portion.id}>
              {portion.name}
            </option>
          ))}
        </select>
        <select className="w-full border p-2 mb-2" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!portionId}>
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        <select className="w-full border p-2 mb-2" value={chapterId} onChange={(e) => setChapterId(e.target.value)} disabled={!subjectId}>
          <option value="">Select Chapter</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.name}
            </option>
          ))}
        </select>
        <select className="w-full border p-2 mb-2" value={topicId} onChange={handleTopicChange} disabled={!chapterId}>
          <option value="">Select Topic</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4 border p-2 w-full" />
        <button onClick={handleUpload} disabled={uploading} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition">
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </div>
    </div>
  );
}