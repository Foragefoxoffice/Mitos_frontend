"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    let role = localStorage.getItem("role");

    // ✅ Default guest role setup (if missing)
    if (!role) {
      localStorage.setItem("role", "guest");

      // Set role in cookies (expires in 7 days)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      document.cookie = `role=guest; expires=${expiryDate.toUTCString()}; path=/`;

      role = "guest";
    }

    // ❗ Optionally: redirect if no token at all
    // if (!token && role !== "guest") {
    //   router.push("/");
    //   return;
    // }

    const refreshAccessToken = async () => {
      if (!refreshToken) {
        console.warn("No refresh token found.");
        logout();
        return;
      }

      try {
        const response = await fetch(`https://mitoslearning.in/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.accessToken);
          console.log("✅ Token refreshed successfully.");
        } else {
          console.warn("⚠️ Refresh token expired or invalid. Logging out...");
          logout();
        }
      } catch (error) {
        console.error("❌ Error refreshing token:", error);
        logout();
      }
    };

    const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      router.push("/");
    };

    // ⏰ Refresh every 6 days (proactive before 7-day access token expires)
    const interval = setInterval(refreshAccessToken, 6 * 24 * 60 * 60 * 1000); // every 6 days

    return () => clearInterval(interval);
  }, [router]);
};

export default useAuth;
