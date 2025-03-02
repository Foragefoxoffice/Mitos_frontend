"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if the user is an admin
        if (data.role !== "admin") {
          setError("Access restricted to admin users only.");
          return;
        }

        // Save token and role to local storage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.user.id);
        // Navigate to admin dashboard
        router.push("/admin/types");
      } else {
        // Set error message from server response
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login Error:", err); // Debugging log
      setError("Something went wrong. Please try again.");
    }
  };

  // Handle Google Sign-In success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if the user is an admin
        if (data.role !== "user") {
          setError("Access restricted to admin users only.");
          return;
        }

        // Save token and role to local storage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.user.id);
        // Navigate to admin dashboard
        router.push("/admin/types");
      } else {
        setError(data.message || "Google authentication failed.");
      }
    } catch (err) {
      console.error("Google Login Error:", err); // Debugging log
      setError("Something went wrong. Please try again.");
    }
  };

  // Handle Google Sign-In failure
  const handleGoogleError = () => {
    setError("Google Sign-In failed. Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId="501560257854-oor7kgad2o2dk9l2qhv5ekd5ilmt9h0r.apps.googleusercontent.com">
      <div className="container p-10">
        <div className="flex w-full">
          <div className="w-[40%]">
            <div className="login">
              <div className="login_img">
                <img src="/images/login/login_img.png" alt="" />
              </div>
              <div className="flying_logo">
                <img src="/images/login/pop1.png" alt="" />
                <img src="/images/login/pop2.png" alt="" />
              </div>
            </div>
          </div>
          <div className="w-[60%] ">
            <div className="login_content">
              <div className="logo">
                <img src="/images/logo/logo.png" alt="" />
              </div>

              <h1 className="font-bold text-center pt-6">Admin Login!</h1>
              <form onSubmit={handleSubmit} className="mt-6">
                {/* Email Input */}
                <div className="mb-4">
                  <label htmlFor="email">
                    Email address<span>*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                {/* Password Input */}
                <div className="mb-4">
                  <label htmlFor="password">
                    Password<span>*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>

                {/* Error Message */}
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {/* Submit Button */}
                <div className="forgot">
                  <a href="/auth/register">Forgot your password?</a>
                </div>
                <button type="submit" className="login_btn">
                  Login
                </button>
              </form>

              {/* Google Sign-In Button */}
              <div className="mt-4 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap // Enable one-tap sign-in
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}