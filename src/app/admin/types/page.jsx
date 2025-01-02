"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { HiMenuAlt3 } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { format } from "date-fns";

const UploadPage = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(null);
  const [parentOptions, setParentOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState([]); // State for all data types (questionTypes, subjects, chapters, topics)
  const [filteredData, setFilteredData] = useState([]); // Filtered data based on search input
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("questionType"); // Default to 'questionType'
  const [editingItem, setEditingItem] = useState(null); // Item being edited
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const handleHamburgerClick = () => {
    setIsFilterVisible(!isFilterVisible); // Toggle the filter visibility on hamburger icon click
  };

  const handleFilterClick = (filter) => {
    setFilterType(filter); // Set the selected filter when clicked
  };

  const fetchParentData = async (type) => {
    const endpoint = `http://localhost:5000/api/${type}/`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Failed to fetch ${type}`);
      const data = await response.json();
      setParentOptions(
        data.map((item) => ({
          value: item.id.toString(),
          label: item.name,
        }))
      );
    } catch (error) {
      setMessage(`Error fetching ${type}: ${error.message}`);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const endpoints = {
      questionType: "question-types",
      subject: "subjects",
      chapter: "chapters",
      topic: "topics",
    };

    if (endpoints[filterType]) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/${endpoints[filterType]}`
        );
        if (!response.ok) throw new Error(`Failed to fetch ${filterType}`);
        const data = await response.json();

        console.log("Fetched data:", data);

        // Fetch parent data for chapters and topics
        if (filterType === "chapter" || filterType === "topic") {
          const parentEndpoint =
            filterType === "chapter" ? "subjects" : "chapters";
          const parentResponse = await fetch(
            `http://localhost:5000/api/${parentEndpoint}`
          );
          if (!parentResponse.ok)
            throw new Error(`Failed to fetch parent data`);
          const parentData = await parentResponse.json();

          console.log("Fetched parent data:", parentData);

          // Map parent data to the main data
          const dataWithParents = data.map((item) => {
            const parent =
              parentData.find(
                (p) =>
                  p.id === item.parentId ||
                  p.id === item.subjectId ||
                  p.id === item.chapterId
              ) || {};
            console.log("Matching parent:", parent);
            return { ...item, parentName: parent.name || "Unknown" }; // Set to 'Unknown' if parent name is not found
          });
          setData(dataWithParents);
          setFilteredData(dataWithParents);
        } else {
          setData(data);
          setFilteredData(data);
        }
      } catch (error) {
        setMessage(`Error fetching data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (filterType) {
      fetchData();
    }
  }, [filterType]);

  useEffect(() => {
    // Reset form fields whenever the filter type changes
    setSelectedType(null);
    setParentId(null);
    setName("");
    setParentOptions([]);
    setSearchQuery("");
    setMessage("");
  }, [filterType]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredData(
        data.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredData(data); // Reset filtered data if no search query
    }
  }, [searchQuery, data]);

  const handleTypeChange = async (
    selected
  ) => {
    setSelectedType(selected);
    setParentId(null);
    setParentOptions([]);
    if (selected?.value === "chapter") await fetchParentData("subjects");
    else if (selected?.value === "topic") await fetchParentData("chapters");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    if (
      !parentId &&
      (selectedType?.value === "chapter" || selectedType?.value === "topic")
    ) {
      setMessage("Please select a parent!");
      setLoading(false);
      return;
    }
    let endpoint = "";
    let payload = {};
    switch (selectedType?.value) {
      case "questionType":
        endpoint = "http://localhost:5000/api/question-types/";
        payload = { name };
        break;
      case "subject":
        endpoint = "http://localhost:5000/api/subjects/";
        payload = { name };
        break;
      case "chapter":
        endpoint = "http://localhost:5000/api/chapters/";
        payload = { name, parentId: parseInt(parentId.value, 10) };
        break;
      case "topic":
        endpoint = "http://localhost:5000/api/topics/";
        payload = { name, parentId: parseInt(parentId.value, 10) };
        break;
      default:
        setLoading(false);
        return;
    }
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error(`Failed to upload data for ${selectedType?.value}`);
      setMessage("Data uploaded successfully!");
    } catch (error) {
      setMessage(`Error uploading data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (item) => {
    setEditingItem(item);
    setName(item.name);
    setSelectedType({
      value: filterType,
      label: filterType.charAt(0).toUpperCase() + filterType.slice(1),
    });

    if (filterType === "chapter") {
      await fetchParentData("subjects");
      setParentId({ value: item.subjectId.toString(), label: item.parentName });
    } else if (filterType === "topic") {
      await fetchParentData("chapters");
      setParentId({ value: item.chapterId.toString(), label: item.parentName });
    } else {
      setParentId(null);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const endpoint = `http://localhost:5000/api/${filterType}/${id}`;
        const response = await fetch(endpoint, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error(`Failed to delete ${filterType}`);
        setMessage("Item deleted successfully!");
        fetchData();
      } catch (error) {
        setMessage(`Error deleting item: ${error.message}`);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    if (
      !parentId &&
      (selectedType?.value === "chapter" || selectedType?.value === "topic")
    ) {
      setMessage("Please select a parent!");
      setLoading(false);
      return;
    }
    let endpoint = "";
    let payload = {};
    switch (selectedType?.value) {
      case "questionType":
        endpoint = `http://localhost:5000/api/question-types/${editingItem.id}`;
        payload = { name };
        break;
      case "subject":
        endpoint = `http://localhost:5000/api/subjects/${editingItem.id}`;
        payload = { name };
        break;
      case "chapter":
        endpoint = `http://localhost:5000/api/chapters/${editingItem.id}`;
        payload = { name, parentId: parseInt(parentId.value, 10) };
        break;
      case "topic":
        endpoint = `http://localhost:5000/api/topics/${editingItem.id}`;
        payload = { name, parentId: parseInt(parentId.value, 10) };
        break;
      default:
        setLoading(false);
        return;
    }
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error(`Failed to update data for ${selectedType?.value}`);
      setMessage("Data updated successfully!");
      setEditingItem(null); // Reset editing state
      setName(""); // Clear name input
    } catch (error) {
      setMessage(`Error updating data: ${error.message}`);
    } finally {
      setLoading(false);
      fetchData(); // Fetch updated data
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: "8px",
      width: "100%",
      border: "1px solid #ccc",
      boxShadow: "none",
      fontWeight: "bold",
      padding: "17px",
      transition: "0.3s",
      "&:hover": {
        borderColor: "#51216E",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#888",
      fontSize: "14px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#35095E",
      fontWeight: "bold",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "8px",
      overflow: "hidden",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#51216E" : "#fff",
      color: state.isFocused ? "#fff" : "#333",
      padding: "10px",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#bae7ff",
      },
    }),
  };


  return (
    <div className="flex flex-col mt-16 justify-center ">
      <form
        onSubmit={editingItem ? handleUpdate : handleSubmit}
        className="type_form space-y-4  bg-[#35095E]/15 rounded-lg p-6 "
      >
        <Select
          placeholder="Select Type"
          value={selectedType}
          onChange={handleTypeChange}
          options={[
            { value: "questionType", label: "Question Type" },
            { value: "subject", label: "Subject" },
            { value: "chapter", label: "Chapter" },
            { value: "topic", label: "Topic" },
          ]}
          isClearable
          styles={customStyles}
        />

        {(selectedType?.value === "chapter" ||
          selectedType?.value === "topic") && (
          <Select
            placeholder="Select Parent"
            value={parentId}
            onChange={setParentId}
            options={parentOptions}
            isClearable
            styles={customStyles}
          />
        )}

        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />

        <button
          type="submit"
          disabled={
            loading ||
            !name ||
            !selectedType ||
            (parentOptions.length > 0 && !parentId)
          }
          style={{ margin: 0 }}
          className={` ${
            loading
              ? "bg-gray-400"
              : "bg-gradient-to-t from-[#35095E] to-[#6F13C4] py-4 m-0 rounded-lg text-white"
          }`}
        >
          {loading ? "Uploading..." : editingItem ? "Update" : "Upload"}
        </button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </form>

      <div className="table content ">
        {/* Search and Filter Section */}
        <div className="mt-8 flex justify-end gap-8 relative">
          <div className=" w-auto relative">
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 py-3  px-10 border border-gray-300 rounded-lg focus:outline-none"
            />
            <div className="absolute inset-y-0  left-0 flex items-center pl-3">
              <BiSearch className="text-gray-500 w-5 h-5" />
            </div>
          </div>
          <div className="flex ">
            <button onClick={handleHamburgerClick} className="p-2 rounded-lg">
              <HiMenuAlt3 size={30} /> {/* Hamburger Icon */}
            </button>
          </div>
          {isFilterVisible && (
            <div className="filter-option">
              <button onClick={() => handleFilterClick("questiontype")}>
                Question Type
              </button>
              <button onClick={() => handleFilterClick("subject")}>
                Subject
              </button>
              <button onClick={() => handleFilterClick("chapter")}>
                Chapter
              </button>
              <button onClick={() => handleFilterClick("topic")}>Topic</button>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="mt-8  tables">
          <table className="w-full table-content table-auto border-collapse">
            <thead>
              <tr>
                <th className="">ID</th>
                <th className="">Name</th>
                {filterType === "chapter" || filterType === "topic" ? (
                  <th className="">Parent</th>
                ) : null}
                <th className="">Type</th>
                <th >CreatedAt</th>
                <th className="">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td className="">{item.id}</td>
                  <td className="">{item.name}</td>
                  
                  {filterType === "chapter" || filterType === "topic" ? (
                    <td className="">{item.parentName}</td>
                  ) : null}
                  <td className="">{filterType}</td>
                  <td className="">
        {format(new Date(item.createdAt), "dd/MM/yyyy")} {/* Format the date */}
      </td>
                  <td className="">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-gradient-to-t from-[#35095E] to-[#6F13C4] p-2 px-6 mr-3 rounded-lg text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-[#C5B5CE] text-black p-2 px-6 rounded-md"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
