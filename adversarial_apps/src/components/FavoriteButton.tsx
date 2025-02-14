'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface Props {
    cik: string;
    username: string;
    favorites: string[];
}

export const FavoriteButton = (props: Props) => {
    const { cik, username, favorites } = props;
    const [isFavorite, setIsFavorite] = useState(favorites.includes(cik));
    const [showLoginMessage, setShowLoginMessage] = useState(false);

    // function for handling when the user clicks 'add to favorites' button
    const handleClick = async () => {
        // Checking if the user is logged in
        if (username) {
            try {
                const response = await fetch('/api/call-python-api', {
                    method: "POST",
                    body: JSON.stringify({
                        "action": "add_remove_favorite", "username": username, "cik": cik
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
            setTimeout(() => setShowLoginMessage(false), 3000); // Hide message after 3 seconds
            return;
        }
    }

    return (
        <div>
            <button onClick={handleClick} className="px-4 py-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors flex items-center space-x-2 mt-2">
                <Image
                    src={isFavorite ? "/FilledStar.png" : "/EmptyStar.png"}
                    alt="Favorite Icon"
                    width={30}
                    height={20}
                    className={!isFavorite ? "invert" : ""}
                />
                <span>{isFavorite ? "Remove from Favorites" : "Add to Favorites"}</span>
            </button>

            {/* Message if not logged in */}
            {showLoginMessage && (
                <div className="bg-gray-700 text-white px-4 py-2 rounded-md shadow-md mt-2">
                    Please <Link href="/login" className="underline text-blue-400 hover:text-blue-300 transition">log in</Link> or <Link href="/signup" className="underline text-blue-400 hover:text-blue-300 transition">sign up</Link> to add favorites.
                </div>
            )}
        </div>
    )
}