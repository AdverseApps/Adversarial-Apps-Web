"use client";

import { useState, useEffect } from 'react';

interface ApiResult {
    status: 'success' | 'error';
    data?: unknown;
    message?: string;
}

export default function Dashboard() {
    const [, setResult] = useState<ApiResult | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isReviewer, setIsReviewer] = useState<boolean>(false);
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
        } catch {
            setIsAuthenticated(false); // In case of any error, assume unauthenticated
            setError('Error verifying authentication');
        }
    };

    // similar case to above, just checking isReviewer boolean value instead of full credentials
    const checkReviewer = async () => {
        try {
            const response = await fetch('/api/verify-reviewer', { method: 'GET' });

            if (response.ok) {
                const data = await response.json();
                if (data) { setIsReviewer(true); }
            } else {
                setIsReviewer(false);
                setError('User is not reviewer');
            }
        } catch {
            setIsReviewer(false); // In case of any error, assume regular user
            setError('Error verifying reviewer attribute');
        }
    };

    const logout = async () => {
        try {
            const response = await fetch('/api/logout', { method: 'POST' });

            if (response.ok) {
                setIsAuthenticated(false);
                setIsReviewer(false);
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

    // Run checkAuthentication, checkReviewer when component mounts
    useEffect(() => {
        checkAuthentication();
        checkReviewer();
    }, []);

    if (!isAuthenticated) {
        return (
            <div>
                <h1>{error || 'Please log in to access this page.'}</h1>
            </div>
        );
    }

    // identical case to the code below, just with reviewer indication line
    if (isReviewer) {
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

    else {
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
}
