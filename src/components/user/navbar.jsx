"use client";
import { useEffect, useState } from "react";
import UserDropdown from "../UserDropdown";
import { set } from "date-fns";

 const UserComponent = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
     setRole(localStorage.getItem("role")); 
  }, []);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        const response = await fetch("https://mitoslearning.in/api/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex justify-between items-center ">
      <div></div>
      <div>
        {role === 'guest' ? (
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-all duration-200"
          >
            Login
          </a>
        ) : (
          <UserDropdown user={user} />
        )}
      </div>
    </div>
  );
};
export default UserComponent;