'use client';
import Link from "next/link";
import { useEffect, useState } from "react";

interface props {
    username: string | null;
}

// Component for displaying favorites
export const UserFavoriteCompanies = (props: props) => {
    const { username } = props;
    const [favorites, setFavorites] = useState<string[]>([]);

    // getting favorites
    const getFavorites = async (username: string | null) => {
        if (!username) {
            return;
        }
        const response = await fetch('/api/call-python-api', {
            method: "POST",
            body: JSON.stringify({
                "action": "get_favorites", "username": username
            }),
        });
        if (response.ok) {
            const data = await response.json();
            setFavorites(data.favorites);
            console.log(data.favorites);
        } else {
            console.error("Error getting favorites");
        }
    }

    // calling function to get favorites
    useEffect(() => {
        getFavorites(username);
    }, [username]);


    return (
        <div>
            <h1>Favorite Companies:</h1>
            {favorites.length > 0 ? (
                favorites.map((company, index) => (
                    <p key={index} className="underline"><Link href={`/company/${company}`}>{company}</Link></p>
                ))
            ) : (
                <p>No favorite companies.</p>
            )}
        </div>
    )
}