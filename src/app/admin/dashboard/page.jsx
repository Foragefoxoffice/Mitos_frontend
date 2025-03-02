"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import jwtDecode to avoid SSR issues
const jwtDecode = dynamic(() => import("jwt-decode").then((mod) => mod.jwtDecode), { ssr: false });

const AdminDashboard = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    // Fetch token from localStorage (client-side only)
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        console.log("No token found. Redirecting to login...");
        router.push("/auth/login");
        return;
      }

      // Validate token and check role
      const validateToken = async () => {
        try {
          const decodedToken = await jwtDecode(storedToken);
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
        } finally {
          setLoading(false); // Set loading to false after validation
        }
      };

      validateToken();
    }
  }, [router]);

  // Show loading state while validating token
  if (loading) {
    return <p>Loading...</p>;
  }

  // Redirect or show dashboard based on authentication
  if (!isAuthenticated) {
    return null; // Redirect will happen automatically via useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <ul className="mt-4">
        <li>
          <a href="/admin/manage-users" className="text-blue-500 hover:underline">
            Manage Users
          </a>
        </li>
        <li>
          <a href="/admin/manage-tests" className="text-blue-500 hover:underline">
            Manage Tests
          </a>
        </li>
        <li>
          <a href="/admin/reports" className="text-blue-500 hover:underline">
            View Reports
          </a>
        </li>
        <li>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/auth/login");
            }}
            className="text-red-500 hover:underline"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default AdminDashboard;