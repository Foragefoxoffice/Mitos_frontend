"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function () {
  
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Track admin status

  // Check if logged-in user is an admin
  useEffect(() => {
    const userRole = localStorage.getItem("role"); // Retrieve stored role
    if (userRole !== "admin") {
      router.push("/auth/login"); // Redirect non-admins to login
    } else {
      setIsAdmin(true); // Set admin status
    }
  }, [router]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, role: "admin" }), // Role fixed as "admin"
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/dashboard"); // Redirect to admin dashboard
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Admin - Create Account</h1>
      {isAdmin ? (
        <form onSubmit={handleSubmit} className="mt-4">
          {/* Email Input */}
          <div>
            <label>Email:</label>
            <input
              type="email"
              className="border p-2 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {/* Password Input */}
          <div className="mt-4">
            <label>Password:</label>
            <input
              type="password"
              className="border p-2 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {/* Name Input */}
          <div>
            <label>Name:</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {/* Error Message */}
          {error && <p className="text-red-500">{error}</p>}
          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 mt-4 w-full"
          >
            Create Admin Account
          </button>
        </form>
      ) : (
        <p className="text-red-500 mt-4">Access Denied. Admins only.</p>
      )}
      <p className="mt-4">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-500">
          Login here
        </a>
      </p>
    </div>
  );
};

