"use client";

import { useState, useEffect } from 'react';

export default function Dashboard() {
    const [result, setResult] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [username, setUsername] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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
                setError('Authentication required');
            }
        } catch (err) {
            setIsAuthenticated(false); // In case of any error, assume unauthenticated
            setError('Error verifying authentication');
        }
    };

    const logout = async () => {
        try {
            const response = await fetch('/api/logout', { method: 'POST' });

            if (response.ok) {
                setIsAuthenticated(false);
                setUsername(null);
                setResult(null);
                setError(null);
            } else {
                setError('Error logging out');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error logging out');
        }
    };

    // Run checkAuthentication when component mounts
    useEffect(() => {
        checkAuthentication();
    }, []);

    if (!isAuthenticated) {
        return (
            <div>
                <h1>{error || 'Please log in to access this page.'}</h1>
            </div>
        );
    }

    return (
        <div>
            <h1>Protected Page</h1>
            <p>Only accessible if you are logged in with a valid JWT.</p>

            {/* Display username */}
            <p>Welcome, {username}!</p>

            {/* Logout button */}
            <button onClick={logout}>Log out</button>
        </div>
    );
}
