'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from "next/image";
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
    transaction_code: string;
}

interface CodeProp {
    code: string;
}

const CodeExplanationTooltip = (props: CodeProp) => {
    const { code } = props;
    const [isHovered, setIsHovered] = useState(false);
    // Used a timed interval to fix a bug in the popup
    const timeoutId = useRef<NodeJS.Timeout | number | undefined>(undefined);
    console.log("Code Prop:", code);
    let definition: string | undefined;

    if (code === 'P') {
        definition = 'Open market or private purchase of non-derivative or derivative security';
    } else if (code === 'S') {
        definition = 'Open market or private sale of non-derivative or derivative security';
    } else if (code === 'V') {
        definition = 'Transaction voluntarily reported earlier than required';
    } else if (code === 'A') {
        definition = 'Grant, award or other acquisition pursuant to Rule 16b-3(d)';
    } else if (code === 'D') {
        definition = 'Disposition to the issuer of issuer equity securities pursuant to Rule 16b-3(e)';
    } else if (code === 'F') {
        definition = 'Payment of exercise price or tax liability by delivering or withholding securities incident to the receipt, exercise or vesting of a security issued in accordance with Rule 16b-3';
    } else if (code === 'I') {
        definition = 'Discretionary transaction in accordance with Rule 16b-3(f) resulting in acquisition or disposition of issuer securities';
    } else if (code === 'M') {
        definition = 'Exercise or conversion of derivative security exempted pursuant to Rule 16b-3';
    } else if (code === 'C') {
        definition = 'Conversion of derivative security';
    } else if (code === 'E') {
        definition = 'Expiration of short derivative position';
    } else if (code === 'H') {
        definition = 'Expiration (or cancellation) of long derivative position with value received';
    } else if (code === 'O') {
        definition = 'Exercise of out-of-the-money derivative security';
    } else if (code === 'X') {
        definition = 'Exercise of in-the-money or at-the-money derivative security';
    } else if (code === 'G') {
        definition = 'Bona fide gift';
    } else if (code === 'L') {
        definition = 'Small acquisition under Rule 16a-6';
    } else if (code === 'W') {
        definition = 'Acquisition or disposition by will or the laws of descent and distribution';
    } else if (code === 'Z') {
        definition = 'Deposit into or withdrawal from voting trust';
    } else if (code === 'J') {
        definition = 'Other acquisition or disposition (describe transaction)';
    } else if (code === 'K') {
        definition = 'Transaction in equity swap or instrument with similar characteristics';
    } else if (code === 'U') {
        definition = 'Disposition pursuant to a tender of shares in a change of control transaction';
    }


    const handleMouseEnter = () => {
        clearTimeout(timeoutId.current);
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        timeoutId.current = setTimeout(() => {
            setIsHovered(false);
        }, 150); // Adjust delay (milliseconds) as needed
    };

    return (
        <div
            className="relative inline-block" // Use inline-block for better sizing
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Image
                src="/info.png"
                height={20}
                width={20}
                alt="Info"
                className="invert cursor-pointer"
            />

            {isHovered && (
                <div
                    className="z-50 absolute left-1/2 -translate-x-1/2 top-full bg-blue-800 text-white text-sm p-2 rounded shadow-lg transition-opacity duration-300"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    Code {code}: {definition}
                </div>
            )}
        </div>
    );
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

    // Function to determine transaction impact
    const getTransactionSymbol = (code: string) => {
        const gainingCodes = ["P", "A", "M", "C", "O", "X", "L"];
        const losingCodes = ["S", "D", "F", "H", "G", "U"];
        const neutralCodes = ["V", "I", "E", "W", "Z", "J", "K"];

        if (gainingCodes.includes(code)) return "+";
        if (losingCodes.includes(code)) return "-";
        if (neutralCodes.includes(code)) return "~";
        return ""; // Default fallback if the code is unknown
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
        <div >
            <br />
            <h2 className="text-2xl font-semibold text-white mb-4">Ownership Tracking:</h2>
            <br />
            <p>
                Below is a table of most recent changes in ownership of the company as provided by Form 4 submissions.
                This provides a live updated view of how ownership is changing in real time, as our risk score is only calculated on data given once per year from the annual DEF 14A form.
                <br></br>
                <br></br>
                The letter relates to the exact type of transaction that has occurred. For covenience, we summed up the transaction codes and provided the key:
            </p>
            <ul className='list-disc ml-5'>
                <li>If the transaction code letter has a &quot;+&quot; that means the Receiver has obtained more control over the company.</li>
                <li>If the transaction code letter has a &quot;-&quot; that means the Receiver has lost or given up control over the company.</li>
                <li>If the transaction code letter has a &quot;~&quot; that means the Receiver has not changed their ownership of the company.</li>
            </ul>
            <br />
            {error && <p className="text-red-500">Error: {error}</p>}

            {filings.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Filing Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Accession Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Transaction Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Receiver
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {filings.map((filing, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {filing.fillingDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {filing.accessionNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center gap-2 relative">
                                        {filing.transaction_code} {getTransactionSymbol(filing.transaction_code)} <CodeExplanationTooltip code={filing.transaction_code} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {filing.issuer}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {filing.reporter}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && <p>No recent ownership records found.</p>
            )}

            {loading && <p className="text-gray-300">Loading...</p>}
            {!loading && hasMore && (
                <div>
                    <button
                        onClick={fetchNextPage}
                        className="px-4 py-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors flex items-center space-x-2 mt-2"
                    >
                        View More
                    </button>
                    <br />
                </div>
            )}
        </div>
    );
};
