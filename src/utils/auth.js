// utils/auth.js

// 🔍 Get role from localStorage -> cookie -> fallback to 'guest'
export const getUserRole = () => {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("role") || // 🔁 Match useAuth key
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("role="))
        ?.split("=")[1] ||
      "guest"
    );
  }
  return "guest";
};

// ✅ Set role in both localStorage and cookie (30 days cookie)
export const setUserRole = (role) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("role", role);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    document.cookie = `role=${role}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
  }
};

// ❌ Clear role from both localStorage and cookie
export const clearUserRole = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("role");
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};
