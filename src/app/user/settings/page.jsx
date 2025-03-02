"use client";
import { useState, useEffect } from "react";

export default function UserSettings() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    age: "",
    gender: "",
    password: "",
    profile: null, // Will store the uploaded file
  });

  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  useEffect(() => {
    // Fetch user details
    const fetchUser = async () => {
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
      setFormData({
        name: data.name || "",
        phoneNumber: data.phoneNumber || "",
        age: data.age || "",
        gender: data.gender || "",
        password: "",
      });
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("phoneNumber", formData.phoneNumber);
    formDataToSend.append("age", formData.age);
    formDataToSend.append("gender", formData.gender);
    if (formData.password) formDataToSend.append("password", formData.password);
    if (formData.profile) formDataToSend.append("profile", formData.profile);

    const res = await fetch(`http://localhost:5000/api/users/update-profile/${user.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }, // No 'Content-Type' for FormData
      body: formDataToSend,
    });

    const responseData = await res.json();
    if (!res.ok) return alert(responseData.message);

    alert("Profile updated successfully!");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="max-w-lg mx-auto p-5 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">User Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full p-2 border rounded" />
        <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Phone Number" className="w-full p-2 border rounded" />
        <input name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Age" className="w-full p-2 border rounded" />
        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="New Password" className="w-full p-2 border rounded" />
        <input name="profile" type="file" onChange={handleChange} className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Update Profile</button>
      </form>
    </div>
  );
}
