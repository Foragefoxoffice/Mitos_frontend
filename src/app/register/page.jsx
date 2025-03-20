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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://mitoslearning.in/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, role: "user" }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.user.id);
        router.push("/user/dashboard");
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
      const res = await fetch("https://mitoslearning.in/api/auth/google-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: credentialResponse.credential }), // Send the Google ID token
      });
  
      const data = await res.json();
  
      if (res.ok) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.user.id);

        router.push("/user/dashboard"); 
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
          <div className="md:w-[60%] w-[100%]">
            <div className="login_content">
              <div className="logo">
                <img src="/images/logo/logo.png" alt="" />
              </div>

              <h1 className="font-bold text-center pt-6">Create Account</h1>
             
                <>
                <form onSubmit={handleSubmit} className="mt-6">
                  {/* Email Input */}
                  <div className="mb-4">
                    <label>Email address<span>*</span></label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                  {/* Password Input */}
                  <div className="mb-4">
                    <label>Password<span>*</span></label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Your Password"
                    />
                  </div>
                  {/* Name Input */}
                  <div className="mb-4">
                    <label>User Name<span>*</span></label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter User Name"
                    />
                  </div>
               
                  {/* Error Message */}
                  {error && <p className="text-red-500">{error}</p>}
                  {/* Submit Button */}
                  <button type="submit" className="login_btn">
                    Create Account
                  </button>
                  
                </form>
                 <div className="mt-4 flex justify-center">
                 <GoogleLogin
                   onSuccess={handleGoogleSuccess}
                   onError={handleGoogleError}
                 />
               </div>
               </>
             
              <p className="mt-2 text-center">
                Already have an account?{" "}
                <a href="/" className="text-[#35095E]">Login here</a>
              </p>
            </div>
          </div>
        </div>
      </div>

    </GoogleOAuthProvider>
  );
}