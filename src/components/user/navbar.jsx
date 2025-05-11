"use client";
import { useEffect, useState } from "react";
import UserDropdown from "../UserDropdown";

 const UserComponent = () => {
  const [user, setUser] = useState(null);

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
    <div className="flex justify-between">
      <div></div>
      <div>
        <UserDropdown user={user} />
      </div>
    </div>
  );
};
export default UserComponent;