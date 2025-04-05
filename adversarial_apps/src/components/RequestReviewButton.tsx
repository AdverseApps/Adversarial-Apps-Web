"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";

interface RequestReviewButtonProps {
  identifier: string; // Was previously called `cik`
  source: "SEC" | "SAM";
  username: string | null;
  role: string | null; // Expected values: "TRUE" or "FALSE"
  entityName: string | null;
}

export default function RequestReviewButton({
  identifier,
  source,
  username,
  role,
  entityName,
}: RequestReviewButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [showReviewerMessage, setShowReviewerMessage] = useState(false);

  // Determine if user is logged in.
  const isLoggedIn = Boolean(username);
  // For regular users, role should be false.
  const isRegularUser = isLoggedIn && role === "false";

  const handleRequestReview = async () => {
    // Handle case if user is not logged in
    if (!username) {
      setShowLoginMessage(true);
      setTimeout(() => setShowLoginMessage(false), 3000); // Auto-hide after 3 seconds
      return;
    }

    // Handle case if user is a reviewer
    if (role === "true") {
      setShowReviewerMessage(true);
      setTimeout(() => setShowReviewerMessage(false), 3000); // Auto-hide after 3 seconds
      return;
    }

    if (isLoggedIn && isRegularUser) {
      try {
        setLoading(true);
        console.log("adding review request ");
        const payload = {
          action: "request_company_review",
          username,
          identifier,
          source,
          entityName,
        };
        const response = await fetch("/api/call-python-api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error("Failed to request review");
        }
        const result = await response.json();
        if (result.status !== "success") {
          toast.error(`Error: ${result.message || result.error}`);
          return;
        }
        toast.success(
          result.message || "Review request submitted successfully!"
        );
        router.refresh();
      } catch (error) {
        console.error("Request review error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Button is grayed out (but clickable) if not logged in or if user is a reviewer
  const shouldGrayOut = !username || role === "true";
  {
    /* Message if not logged in */
  }

  return (
    <div>
      <button
        onClick={loading ? undefined : handleRequestReview}
        disabled={loading}
        className={`px-4 py-2 rounded-md shadow-md transition-colors flex items-center space-x-2 mt-2 ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : shouldGrayOut
            ? "bg-gray-500 hover:bg-gray-600 cursor-pointer"
            : "bg-blue-900 hover:bg-blue-600"
        }`}
      >
        {loading ? "Submitting..." : "Request Company Review"}
      </button>
      {/* Inline message if not logged in */}
      {showLoginMessage && (
        <div className="bg-gray-700 text-white px-4 py-2 rounded-md shadow-md mt-2 flex justify-between items-center max-w-md">
          <span>
            Please{" "}
            <Link
              href="/login"
              className="underline text-blue-400 hover:text-blue-300 transition"
            >
              log in
            </Link>{" "}
            or{" "}
            <Link
              href="/signup"
              className="underline text-blue-400 hover:text-blue-300 transition"
            >
              sign up
            </Link>{" "}
            to request a company review.
          </span>
          <button
            onClick={() => setShowLoginMessage(false)}
            className="ml-4 text-white font-bold text-lg hover:text-gray-300"
          >
            <Image
              src="/x.png"
              alt="Close"
              width={18}
              height={20}
              className="cursor-pointer hover:opacity-80 invert"
            />
          </button>
        </div>
      )}
      {/* Message if user is a reviewer */}
      {showReviewerMessage && (
        <div className="bg-gray-700 text-white px-4 py-2 rounded-md shadow-md mt-2 flex justify-between items-center max-w-md">
          <span>
            Reviewers cannot request company reviews. You may view requests on
            your dashboard.
          </span>
          <button
            onClick={() => setShowReviewerMessage(false)}
            className="ml-4 text-white font-bold text-lg hover:text-gray-300"
          >
            <Image
              src="/x.png"
              alt="Close"
              width={18}
              height={20}
              className="cursor-pointer hover:opacity-80 invert"
            />
          </button>
        </div>
      )}
    </div>
  );
}
