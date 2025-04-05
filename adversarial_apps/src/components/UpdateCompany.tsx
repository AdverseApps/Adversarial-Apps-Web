"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface VerifyButtonProps {
  identifier: string; // CIK for SEC, UEI for SAM
  source: "SEC" | "SAM"; // New prop to indicate the source
  entityName: string;
}

export default function VerifyUpdate({
  identifier,
  source,
  entityName,
}: VerifyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<string>(""); // Ensure controlled input

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    const numericScore = parseFloat(score);

    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      toast.error("Please enter a valid risk score between 0 and 100.");
      return;
    }

    setLoading(true);

    try {
      const data = {
        action: "update_company_score",
        identifier, // CIK or UEI
        source, // SEC or SAM
        risk_score: numericScore,
        entityName,
      }; // Use state value

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

      let result;

      try {
        result = await response.json();
      } catch (jsonErr) {
        console.error("Failed to parse JSON from backend:", jsonErr);
        const rawText = await response.text();
        console.error("Raw response text:", rawText);
        toast.error("Server returned invalid JSON.");
        return;
      }

      if (!response.ok || !result || result.status !== "success") {
        console.error("Backend returned error:", result);
        toast.error(
          `Error updating company: ${
            result?.message || result?.error || "Unknown error"
          }`
        );
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
    <form
      className="flex flex-col sm:flex-row items-end py-2 gap-4"
      onSubmit={handleUpdate}
    >
      {/* Input Field Container */}
      <div className="flex flex-col">
        <label
          htmlFor="riskscore"
          className="block text-sm font-medium text-white"
        >
          Risk Score:
        </label>
        <input
          type="number"
          id="riskscore"
          name="riskscore"
          min="0"
          max="100"
          step="0.01"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="w-64 px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          placeholder="Input score..."
          required
        />
      </div>

      {/* Button Aligned to Bottom */}
      <button
        type="submit"
        disabled={loading}
        className={`px-6 py-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors self-end ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Updating..." : "Update Risk Score"}
      </button>
    </form>
  );
}
