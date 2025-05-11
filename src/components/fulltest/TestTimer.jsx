  "use client";
  import React from "react";
  import dynamic from 'next/dynamic';

  const Select = dynamic(() => import("react-select"), { ssr: false });

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: "8px",
      width: "200px",
      border: "1px solid #ccc",
      boxShadow: "none",
      fontWeight: "bold",
      padding: "5px",
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
      "&:active": { backgroundColor: "#51216E",color:"#fff" },
    }),
  };

  export const TestTimer = ({ timeLeft, formatTime, getUniqueSubjects, subjectFilter, setSubjectFilter, handleSubmit }) => {
    // Prepare options for react-select
    const subjectOptions = [
      { value: null, label: "All Subjects" },
      ...getUniqueSubjects.map(subject => ({
        value: subject.id,
        label: subject.name
      }))
    ];

    // Handle select change
    const handleSelectChange = (selectedOption) => {
      setSubjectFilter(selectedOption.value);
    };

    // Find the currently selected option
    const selectedOption = subjectOptions.find(option => option.value === subjectFilter) || subjectOptions[0];

    return (
      <div className="md:flex justify-between items-center">
        <p className="mt-2 mb-5 md:mb-0 flex items-center gap-2">
          <img width={30} src="/images/menuicon/time.png" />{" "}
          <span className="text-[#FF0000] text-xl">
            {formatTime(timeLeft)} MIN
          </span>
        </p>
        <div className="flex items-center gap-4">
          {getUniqueSubjects.length > 0 && (
            <Select
              options={subjectOptions}
              value={selectedOption}
              onChange={handleSelectChange}
              styles={customStyles}
              isSearchable={false}
            />
          )}
          <button
            onClick={handleSubmit}
            className="btn"
            style={{ padding: "0.5rem 3rem" }}
          >
            Submit
          </button>
        </div>
      </div>
    );
  };