'use client';
import React from 'react'
import { useEffect, useState } from "react";

interface SearchResultsHandlerProps {
  query: string;
  cik: string;
  currentPage: number;
}

export default function SearchResultsHandler({ query, cik, currentPage }: SearchResultsHandlerProps) {
  
  const [results, setResults] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  useEffect(() => {
    if (cik) {
      setHasSearched(true);
      fetchResults(cik);
    } else {
      setHasSearched(false);
      setResults([]);
    }
  }, [cik]);

  async function fetchResults(cik: string) {
    console.log("cik:",cik);
    const data = { action: "get_sec_data", search_term: cik };
    const response = await fetch('/api/call-python-api', {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    console.log("clicked Company");
    console.log(result);
    if (result.status === "success") {
        setResults(result.data);
    } else {
        setResults(null);
    }
  }
  
  
  return (
    <div className="flex justify-center mt-6">
      {!hasSearched ? (
        <div className="text-center text-lg">
          <p>Please input a company name</p>
          <p>This will pull up a list of related companies</p>
          <p>Results will list:</p>
          <ul>
            <li>Company:</li>
            <li>Country:</li>
            <li>DFR14 found:</li>
          </ul>
        </div>
      ) : results ? (
        <div className="text-center text-xl">
          <h2>Details for CIK {cik}:</h2>
          <pre className="mt-4 text-left whitespace-pre-wrap">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      ) : (
        <p className="text-center text-lg">No data found for CIK {cik}.</p>
      )}
    </div>
  );
}
