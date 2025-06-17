'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa"; // ✅ React icon
import UserDropdown from "../UserDropdown";


const PracticeNavbar = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

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
      <div className="test_header flex justify-between">
        <div className="flex justify-center items-center gap-6">    <button
          onClick={() => router.back()}
          className="flex items-center p-3 rounded-md ml-4 h-10"
        >
          <FaArrowLeft className="text-lg" />
          <span className="text-sm text-white pl-2 font-medium">Back</span>
        </button>
          <h1 className="font-bold text-xl md:text-3xl">Practice</h1></div>
        
          <Image src={"/images/logo/logo.png"}  className="hidden md:block" alt="logo" width={150} height={80} />
            <UserDropdown user={user} />
      </div>
      
    </div>
  );
};

export default PracticeNavbar;
