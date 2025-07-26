"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import useAuth from "@/contexts/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useAuth();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("https://mitoslearning.in/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if the user is an admin
        if (data.role !== "user") {
          setError("Access restricted to student users only.");
          return;
        }

        // Save token and role to local storage
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.user.id);
        setIsLoading(true);
        // Navigate to admin dashboard
        router.push("/user/dashboard");
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
      const response = await fetch(
        "https://mitoslearning.in/api/auth/google-auth",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: credentialResponse.credential }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Check if the user is an admin
        if (data.role !== "user") {
          setError("Access restricted to admin users only.");
          return;
        }

        // Save token and role to local storage
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.user.id);

        // Navigate to admin dashboard
        router.push("/user/dashboard");
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
          <div className="w-[40%] hidden md:flex">
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
          <div className="w-[100%] md:w-[60%] ">
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
                <button
                  type="submit"
                  className="login_btn flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                  )}
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="mt-2 text-center">
                You don't have an account?{" "}
                <a href="/register" className="text-[#35095E]">
                  Signin here
                </a>
              </p>

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
