"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface VerifyButtonProps {
  cik: string;
}

export default function VerifyUpdate({ cik }: VerifyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | "">(""); // Ensure controlled input

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (score === "" || isNaN(Number(score))) {
        toast.error("Please enter a valid risk score between 0 and 100.");
        return;
    }
    
    setLoading(true);
    
    try {
      const data = { action: "update_company_score", cik, riskscore: Number(score) }; // Use state value

      console.log("Submitting Data:", data);

      const response = await fetch(`/api/call-python-api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update company score");
      }

      const result = await response.json();

      if (result.status !== "success") {
        toast.error(`Error updating company: ${result.message || result.error}`);
        return;
      }

      toast.success(result.message || "Company score updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Error updating company. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-row py-2" onSubmit={handleUpdate}>
      <div>
        <label htmlFor="riskscore" className="block text-sm font-medium text-white">
          Risk Score (0 - 100):
        </label>
        <input
          type="number"
          id="riskscore"
          name="riskscore"
          min="0"
          max="100"
          value={score} // Bind state value
          onChange={(e) => setScore(e.target.value ? Number(e.target.value) : "")} // Update state on input change
          className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          placeholder="Input score..."
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors flex items-center space-x-2 mt-2 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Updating..." : "Update Company"}
      </button>
    </form>
  );
}
