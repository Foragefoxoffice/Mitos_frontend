"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode";

const AdminDashboard = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);

    if (!token) {
      console.log("No token found. Redirecting to login...");
      router.push("/auth/login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      console.log("Decoded token:", decodedToken);

      if (decodedToken.role !== "admin") {
        console.log("Role mismatch. Redirecting to login...");
        router.push("/auth/login");
      } else {
        setIsAuthenticated(true);
        console.log("Admin authenticated.");
      }
    } catch (error) {
      console.error("Token decoding failed:", error);
      localStorage.removeItem("token");
      router.push("/auth/login");
    }
  }, [router]);

  if (!isAuthenticated) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <ul className="mt-4">
        <li>
          <a href="/admin/manage-users" className="text-blue-500">Manage Users</a>
        </li>
        <li>
          <a href="/admin/manage-tests" className="text-blue-500">Manage Tests</a>
        </li>
        <li>
          <a href="/admin/reports" className="text-blue-500">View Reports</a>
        </li>
        <li>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/auth/login");
            }}
            className="text-red-500"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default AdminDashboard;
