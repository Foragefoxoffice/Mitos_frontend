// src/commonLoader.jsx
export default function CommonLoader() {
  return (
    <div className="flex justify-center relative align-baseline items-center h-screen">
      <div style={{
        top: "80px"
      }} className="loader animate-spin absolute rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}
