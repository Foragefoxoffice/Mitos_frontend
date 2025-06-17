"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function UserSettings() {
  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "+91",
    age: "",
    gender: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication required. Please log in.");
        }

        const response = await fetch("https://mitoslearning.in/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data. Status: ${response.status}`);
        }

        const userData = await response.json();

        if (!userData) {
          throw new Error("No user data received from server");
        }

        // Initialize form data with user data
        setUser(userData);
        setFormData({
          name: userData.name || "",
          phoneNumber: userData.phoneNumber || "+91",
          age: userData.age ? userData.age.toString() : "",
          gender: userData.gender || "",
          password: "",
        });

        // Set profile picture preview if exists
        if (userData.profile) {
          setProfilePreview(
            userData.profile.startsWith('http')
              ? userData.profile
              : `https://mitoslearning.in${userData.profile}`
          );
        }
      } catch (err) {
        console.error("User data fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle profile image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate the selected file
    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file (JPEG, PNG, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("Image size must be less than 5MB");
      return;
    }

    setProfileImage(file);

    // Create preview for the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      // Prepare FormData for the request
      const formDataToSend = new FormData();

      // Append all form fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("age", formData.age);
      formDataToSend.append("gender", formData.gender);

      // Only append password if provided
      if (formData.password) {
        formDataToSend.append("password", formData.password);
      }

      // Append profile image if selected
      if (profileImage) {
        formDataToSend.append("profile", profileImage);
      }

      // Send the update request
      const response = await fetch(
        `https://mitoslearning.in/api/users/update-profile/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            // Note: Don't set Content-Type header for FormData
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Profile update failed");
      }

      const responseData = await response.json();

      // Update local state with the new data
      setUser(responseData.user);
      if (responseData.user.profile) {
        setProfilePreview(
          responseData.user.profile.startsWith('http')
            ? responseData.user.profile
            : `https://mitoslearning.in${responseData.user.profile}`
        );
      }

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      alert(err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-md mx-auto p-5 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto my-4"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto p-5 text-red-500">
        <p className="font-medium">Error loading profile:</p>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-500 hover:text-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className="p-5 md:p-10 bg-white rounded-lg shadow-sm">
      {/* Profile Header Section */}
      <div className="md:flex justify-between">
        <div className="flex items-center mb-6">
          {/* Profile Picture with Upload Button */}
          <div className="relative mr-4">
            {profilePreview ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src={profilePreview}
                  alt="Profile"
                  fill
                  className="object-cover"
                  unoptimized={true} // For local development
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/user/default.png";
                  }}
                />
              </div>
            ) : (
              <div className="rounded-full bg-gray-200 w-20 h-20 flex items-center justify-center border-2 border-gray-300">
                <span className="text-gray-500 text-xl">👤</span>
              </div>
            )}

            <label className="absolute -bottom-1 -right-1 bg-[#35095E] text-white rounded-full p-1.5 cursor-pointer hover:bg-blue-600 transition-colors shadow-md">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </label>
          </div>



          {/* User Name */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user?.name || "User"}</h2>
            <p className="text-sm text-gray-500">
              {user?.email || "Update your profile"}
            </p>
          </div>
        </div>
        <div className="hidden md:block">
          <button
            type="button"
            onClick={handleLogout}
            className=" text-[16px] py-3 px-8 btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Log Out
          </button>
        </div>
      </div>



      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-5">

          <div className="md:flex grid items-center gap-5 md:gap-8">
            {/* Name Field */}
            <div className="w-full md:w-[50%]">
              <label className="block text-gray-700 mb-1 text-md font-medium">
                Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full p-3 border-b focus:outline-none focus:border-[#35095E] text-gray-700"
                required
              />
            </div>

            {/* Phone Number Field */}
            <div className="w-full md:w-[50%]">
              <label className="block text-gray-700 mb-1 text-md font-medium">
                Phone Number
              </label>
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full p-3 border-b focus:outline-none focus:border-[#35095E] text-gray-700"
                required
              />
            </div>
          </div>

          <div className="md:flex grid items-center gap-5 md:gap-8">

            {/* Age Field */}
            <div className="w-full md:w-[50%]">
              <label className="block text-gray-700 mb-1 text-md font-medium">
                Age
              </label>
              <input
                name="age"
                type="number"
                min="13"
                max="120"
                value={formData.age}
                onChange={handleChange}
                placeholder="Your age"
                className="w-full p-3 border-b focus:outline-none focus:border-[#35095E] text-gray-700"
              />
            </div>

            {/* Gender Field */}
            <div className="w-full md:w-[50%]">
              <label className="block text-gray-700 mb-1 text-md font-medium">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 border-b border-gray-200 focus:outline-none focus:border-[#35095E] text-gray-700 bg-white"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 mb-1 text-md font-medium">
              New Password (leave blank to keep current)
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full p-3 border-b focus:outline-none focus:border-[#35095E] text-gray-700"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn w-full "
          style={{ marginTop: 40 }}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>


      </form>
    </div>
  );
}