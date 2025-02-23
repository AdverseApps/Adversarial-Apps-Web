'use client';

import { useEffect, useState } from 'react';

interface Props {
    cik: string;
}

interface FilingReport {
    accessionNumber: string;
    filingDate: string;
    form: string;
    issuer: string;
    reporter: string;
}

export const RecentOwnership = ( props: Props) => {
    const { cik } = props;

    const [filings, setFilings] = useState<FilingReport[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/call-python-api', {
                    method: "POST",
                    body: JSON.stringify({ action: "get_recent_ownerships", "cik": cik, pagination: 1 }),
                });

                const result = await response.json();

                if (response.ok && result.status === "success") {
                    setFilings(result.recentOwnerships);
                } else {
                    setError("Failed to fetch recent ownership data.");
                }
            } catch (err) {
                setError("Error fetching data: " + err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [cik]); // Fetch data when `cik` changes

    return (
        <div>
            <h2>Recent Owners:</h2>
            <br/>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p style={{ color: "red" }}>Error: {error}</p>
            ) : (
                <ul>
                    {filings.length > 0 ? (
                        filings.map((filing, index) => (
                            <li key={index}>
                                <p>Filing date: {filing.filingDate}</p>
                                <p>Accession Number: {filing.accessionNumber}</p>
                                <p>Form: {filing.form}</p>
                                <p>Issuer: {filing.issuer}</p>
                                <p>Reporter: {filing.reporter}</p>
                                <br/>
                            </li>
                        ))
                    ) : (
                        <p>No recent ownership records found.</p>
                    )}
                </ul>
            )}
        </div>
    );
}