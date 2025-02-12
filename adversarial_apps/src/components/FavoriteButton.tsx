'use client';
import { useEffect, useState } from "react";

interface Props {
    cik: string;
}

export const FavoriteButton = (props: Props) => {
    const { cik } = props;

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [username, setUsername] = useState<string | null>(null);

    // Function to check for valid JWT and fetch username
    const checkAuthentication = async () => {
        try {
            const response = await fetch('/api/verify-login', { method: 'GET' });

            if (response.ok) {
                const data = await response.json();
                setIsAuthenticated(true);
                setUsername(data.user); // Set username from the API response
            } else {
                setIsAuthenticated(false);
            }
        } catch {
            setIsAuthenticated(false); // In case of any error, assume unauthenticated
        }
    };

    useEffect(() => {
        checkAuthentication();
     }, []);

    return (
        <div>
            <button className="px-4 py-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors flex items-center space-x-2 mt-2">Add to Favorites</button>
        </div>
    )
}