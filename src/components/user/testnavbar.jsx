'use client';
import { useEffect, useRef, useState } from "react";
import UserDropdown from "../UserDropdown";
import Image from "next/image";

const TestNavbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token"); // Get token from localStorage

      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        const response = await fetch("https://mitoslearning.in/api/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send token in the header
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
    <div className="">
      <div className="test_header flex justify-between items-center">
       
          <h1 className="font-bold text-2xl md:text-3xl">Test</h1>
          <Image src={"/images/logo/logo.png"}  className="hidden md:block" alt="logo" width={150} height={80} />
          <UserDropdown user={user} />
      </div>
      
    </div>
  );
};

export default TestNavbar;
