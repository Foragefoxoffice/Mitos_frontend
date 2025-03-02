"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode"; // To decode the JWT token

export default function AdminRegister() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if logged-in user is an admin
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole !== "admin") {
      router.push("/auth/login");
    } else {
      setIsAdmin(true);
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
        body: JSON.stringify({ email, password, name, role: "admin" }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  // Handle Google Sign-In success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: credentialResponse.credential }), // Send the Google ID token
      });
  
      const data = await res.json();
  
      if (res.ok) {
        localStorage.setItem("token", data.token); // Store the token
        localStorage.setItem("role", data.role); // Store the role
        router.push("/dashboard"); // Redirect to dashboard
      } else {
        setError(data.message || "Google authentication failed.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };
  // Handle Google Sign-In failure
  const handleGoogleError = () => {
    setError("Google Sign-In failed. Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId="501560257854-oor7kgad2o2dk9l2qhv5ekd5ilmt9h0r.apps.googleusercontent.com">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold">Admin - Create Account</h1>
        {isAdmin ? (
          <>
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

            {/* Google Sign-In Button */}
            <div className="mt-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            </div>
          </>
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
    </GoogleOAuthProvider>
  );
}