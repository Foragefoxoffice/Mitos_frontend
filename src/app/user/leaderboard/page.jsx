"use client";

import { useEffect, useState } from "react";
import { fetchLeaderBoard } from "@/utils/api";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await fetchLeaderBoard(); // No need for response.ok
        setLeaderboard(data);
      } catch (err) {
        setError("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-5 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Leaderboard</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Rank</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Score</th>
            <th className="border p-2">Accuracy (%)</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((user) => (
            <tr key={user.userId} className="text-center">
              <td className="border p-2">{user.rank}</td>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.totalScore}</td>
              <td className="border p-2">
  {parseFloat(user.accuracy).toFixed(2)}%
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
