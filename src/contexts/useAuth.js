"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    let role = localStorage.getItem("role");

    // If role doesn't exist, set it to "guest"
if (!role) {
  // Set role in localStorage
  localStorage.setItem("role", "guest");

  // Set role in cookies (expires in 7 days)
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  document.cookie = `role=guest; expires=${expiryDate.toUTCString()}; path=/`;

  role = "guest";
}

    // If no token, redirect to homepage
    // if (!token) {
    //   router.push("/");
    //   return;
    // }

    const refreshAccessToken = async () => {
      try {
        const response = await fetch(`https://mitoslearning.in/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.accessToken);
          console.log("Token refreshed successfully.");
        } else {
          console.warn("Refresh token expired, logging out...");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("role");
          router.push("/");
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        router.push("/");
      }
    };

    // Refresh token every 5 hours
    const interval = setInterval(refreshAccessToken, 5 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [router]);
};

export default useAuth;
