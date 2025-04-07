"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

interface Props {
  identifier: string; // CIK for SEC or entity_id for SAM
  source: "SEC" | "SAM"; // Company type
  username: string;
  favorites: string[];
  entityName: string;
}

export const FavoriteButton = (props: Props) => {
  const { identifier, source, username, favorites, entityName } = props;

  const [isFavorite, setIsFavorite] = useState(favorites.includes(identifier));
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  // ✅ Check backend to determine favorite status on component mount
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!username) return;

      try {
        const response = await fetch("/api/call-python-api", {
          method: "POST",
          body: JSON.stringify({
            action: "get_favorites",
            username,
          }),
        });

        const data = await response.json();

        if (response.ok && data.status === "success") {
          const favoriteList =
            source === "SEC" ? data.sec_favorites : data.sam_favorites;
          setIsFavorite(favoriteList.includes(identifier));
        } else {
          console.warn("Error fetching favorites:", data.message);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    fetchFavorites();
  }, [username, identifier, source]);

  // Handles add/remove click
  const handleClick = async () => {
    if (username) {
      try {
        const response = await fetch("/api/call-python-api", {
          method: "POST",
          body: JSON.stringify({
            action: "add_remove_favorite",
            username,
            identifier,
            source,
            entityName,
          }),
        });

        const data = await response.json();
        console.log(data.message);

        if (response.ok) {
          setIsFavorite((prev) => !prev);
        }
      } catch (error) {
        console.error("Error adding/removing favorite:", error);
      }
    } else {
      setShowLoginMessage(true);
      setTimeout(() => setShowLoginMessage(false), 3000);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors flex items-center space-x-2 mt-2"
      >
        <Image
          src={isFavorite ? "/FilledStar.png" : "/EmptyStar.png"}
          alt="Favorite Icon"
          width={30}
          height={20}
          className={!isFavorite ? "invert" : ""}
        />
        <span>{isFavorite ? "Remove from Favorites" : "Add to Favorites"}</span>
      </button>

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
            to add favorites.
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
    </div>
  );
};
