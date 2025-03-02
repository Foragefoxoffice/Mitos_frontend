"use client";
import Papa from 'papaparse';
import React, { useState, useEffect } from 'react';
import Select from "react-select";
import { FaPlus } from "react-icons/fa6";

const CSVImporter = () => {
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState(null);
    const [topicId, setTopicId] = useState(null);
    const [file, setFile] = useState(null);
    const [questionTypes, setQuestionTypes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [topics, setTopics] = useState([]);
    const [portions, setPortions] = useState([]);
    const [chapterId, setChapterId] = useState(null);
    const [subjectId, setSubjectId] = useState(null);
    const [portionId, setPortionId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoints = [
                    'http://localhost:5000/api/question-types/',
                    'http://localhost:5000/api/subjects/',
                    'http://localhost:5000/api/chapters/',
                    'http://localhost:5000/api/topics/',
                    'http://localhost:5000/api/portions/',
                ];

                const [questionTypeRes, subjectRes, chapterRes, topicRes, portionRes] = await Promise.all(
                    endpoints.map(endpoint => fetch(endpoint))
                );

                const [questionTypesData, subjectsData, chaptersData, topicsData, portionsData] = await Promise.all([
                    questionTypeRes.json(),
                    subjectRes.json(),
                    chapterRes.json(),
                    topicRes.json(),
                    portionRes.json(),
                ]);

                setQuestionTypes(questionTypesData);
                setSubjects(subjectsData);
                setChapters(chaptersData);
                setTopics(topicsData);
                setPortions(portionsData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setMessage('Error fetching data');
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (topicId) {
            const selectedTopic = topics.find(topic => topic.id === topicId);
            if (selectedTopic) {
                setChapterId(selectedTopic.chapterId);
                const selectedChapter = chapters.find(chapter => chapter.id === selectedTopic.chapterId);
                if (selectedChapter) {
                    setSubjectId(selectedChapter.subjectId);
                    const selectedSubject = subjects.find(subject => subject.id === selectedChapter.subjectId);
                    if (selectedSubject) {
                        setPortionId(selectedSubject.portionId);
                    }
                }
            }
        }
    }, [topicId, topics, chapters, subjects]);

    const createQuestions = async (questions) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No JWT token found in localStorage');
            }

            const response = await fetch('http://localhost:5000/api/questions/many', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ questions, subjectId, chapterId, topicId, portionId }),
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(`Failed to import questions: ${responseData.message || 'Unknown error'}`);
            }

            setMessage('Questions imported successfully');
        } catch (error) {
            console.error('Error importing questions:', error);
            setMessage('Error importing questions');
            throw error;
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!file) {
            setMessage('Please select a CSV file');
            return;
        }
        setImporting(true);
        setMessage(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const questions = results.data
                    .map(question => {
                        const questionType = questionTypes.find(
                            qt => qt.name.trim().toLowerCase() === question.questionType.trim().toLowerCase()
                        );

                        if (!questionType) {
                            console.warn(`Skipping question due to unmatched type: ${question.questionType}`);
                            return null;
                        }

                        return { ...question, questionTypeId: questionType.id };
                    })
                    .filter(Boolean);

                if (!questions.length) {
                    setMessage('No valid questions found in the CSV file.');
                    setImporting(false);
                    return;
                }

                try {
                    await createQuestions(questions);
                } catch {
                    setMessage('Error importing questions');
                } finally {
                    setImporting(false);
                }
            },
        });
    };

    const customStyles = {
        control: (provided) => ({
            ...provided,
            borderRadius: "8px",
            width: "300px",
            border: "1px solid #ccc",
            boxShadow: "none",
            fontWeight: "bold",
            padding: "17px",
            transition: "0.3s",
            "&:hover": {
                borderColor: "#51216E",
            },
        }),
        placeholder: (provided) => ({ ...provided, color: "#888", fontSize: "14px" }),
        singleValue: (provided) => ({ ...provided, color: "#35095E", fontWeight: "bold" }),
        menu: (provided) => ({ ...provided, borderRadius: "8px", overflow: "hidden" }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? "#51216E" : "#fff",
            color: state.isFocused ? "#fff" : "#333",
            padding: "10px",
            cursor: "pointer",
            "&:active": { backgroundColor: "#bae7ff" },
        }),
    };

    return (
        <div className='py-10'>
            <form onSubmit={handleSubmit}>
                <div>
                    <Select
                        options={topics.map(topic => ({
                            value: topic.id,
                            label: topic.name,
                        }))}
                        onChange={(selectedOption) => setTopicId(selectedOption?.value ?? null)}
                        placeholder="Select a Topic"
                        isClearable
                        styles={customStyles}
                    />
                </div>
                <div className='p-20 my-8 border-dashed border-2 grid gap-3 place-items-center'>
                    <label className='text-2xl font-bold text-[#B9B9B9]' htmlFor="file"> Drag & Drop to Upload</label>
                    <p className='text-2xl font-bold text-[#B9B9B9]'>or</p>
                    <label className='file_upload' htmlFor="file"> <FaPlus size={40} className='file_icon' /> Select Files to Upload</label>
                    <input
                        type="file"
                        name='file'
                        id='file'
                        hidden
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        required
                        disabled={importing}
                    />
                </div>
                <button type="submit" className='btn' disabled={importing}>
                    {importing ? 'Importing...' : 'Upload'}
                </button>
                <div>{message && <p>{message}</p>}</div>
            </form>
        </div>
    );
};

export default CSVImporter;