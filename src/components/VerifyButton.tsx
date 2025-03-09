"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface VerifyButtonProps {
  cik: string;
}

export default function VerifyButton({ cik }: VerifyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const data = { action: "verify_company", cik };
      // Call an API route to mark the company as verified, for example:
      const response = await fetch(`/api/call-python-api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to verify company");
      }

      const result = await response.json();

      if (result.status !== "success") {
        toast.error(
          `Error verifying company: ${result.message || result.error}`
        );
        return;
      }
      // Optionally refresh or provide feedback
      toast.success(result.message || "Company verified successfully!");
      router.refresh();
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Error verifying company. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleVerify}
      disabled={loading}
      className={`px-4 py-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors flex items-center space-x-2 mt-2 ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? "Verifying..." : "Verify Company"}
    </button>
  );
}
