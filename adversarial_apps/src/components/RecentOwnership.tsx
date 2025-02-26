'use client';

import { useEffect, useState, useCallback } from 'react';

interface Props {
    cik: string;
}

// Type for the data being recieved from API
interface FilingReport {
    accessionNumber: string;
    fillingDate: string;
    form: string;
    issuer: string;
    reporter: string;
}

export const RecentOwnership = (props: Props) => {
    const { cik } = props;

    // State variables
    const [filings, setFilings] = useState<FilingReport[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [preloadedData, setPreloadedData] = useState<FilingReport[]>([]);

    // Fetch data function
    const fetchData = useCallback(async (pageNum: number, isInitial: boolean = false, isPreload: boolean = false) => {
        setLoading(true);
        try {
            const response = await fetch('/api/call-python-api', {
                method: "POST",
                body: JSON.stringify({ action: "get_recent_ownerships", cik, pagination: pageNum }),
            });

            const result = await response.json();

            if (response.ok && result.status === "success") {
                if (isInitial) {
                    setFilings(result.recentOwnerships);
                } else if (isPreload) {
                    setPreloadedData(result.recentOwnerships);
                } else {
                    setFilings(prev => [...prev, ...result.recentOwnerships]);
                }
                setHasMore(result.recentOwnerships.length === 5);
            } else {
                setError("Failed to fetch recent ownership data.");
                setHasMore(false);
            }
        } catch (err) {
            setError("Error fetching data: " + err);
        } finally {
            setLoading(false);
        }
    }, [cik]); // Add `cik` as a dependency

    // Fetch and append preloaded data when "View More" is clicked
    const fetchNextPage = () => {
        if (preloadedData.length > 0) {
            setHasMore(true);
            setFilings(prev => [...prev, ...preloadedData]);
            setPreloadedData([]);
            const nextPage = page + 1;
            setPage(nextPage);
            fetchData(nextPage, false, true); // Preload next batch
        } else {
            setHasMore(false);
        }
    };

    // Preload the next page when we get a new page
    useEffect(() => {
        if (hasMore) {
            fetchData(page + 1, false, true);
        }
    }, [page, hasMore, fetchData]);

    // Reset state variables when cik changes
    useEffect(() => {
        setFilings([]);
        setPage(1);
        setHasMore(true);
        setPreloadedData([]);
        fetchData(1, true);
    }, [cik, fetchData]);

    return (
        <div>
            <br />
            <h2>Recent Owners:</h2>
            <br />
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
            <ul className="space-y-4">
                {filings.length > 0 ? (
                    filings.map((filing, index) => (
                        <li key={index}>
                            <p><strong>Filing Date:</strong> {filing.fillingDate}</p>
                            <p><strong>Accession Number:</strong> {filing.accessionNumber}</p>
                            <p><strong>Form:</strong> {filing.form}</p>
                            <p><strong>Issuer:</strong> {filing.issuer}</p>
                            <p><strong>Reporter:</strong> {filing.reporter}</p>
                        </li>
                    ))
                ) : (
                    !loading && <p>No recent ownership records found.</p>
                )}
            </ul>
            {loading && <p>Loading...</p>}
            {!loading && hasMore && (
                <div>
                    <button onClick={fetchNextPage} className="px-4 py-2 bg-blue-900 text-white rounded-md shadow-md 
                    hover:bg-blue-600 transition-colors flex items-center space-x-2 mt-2">
                        View More
                    </button>
                    <br />
                </div>
            )}
        </div>
    );
};