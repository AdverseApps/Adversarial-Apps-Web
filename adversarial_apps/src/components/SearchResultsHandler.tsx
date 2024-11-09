'use client';
import React from 'react'
import { useEffect, useState } from "react";

interface SearchResultsHandlerProps {
  query: string;
  currentPage: number; //for whenever pagination is added
}
export default function SearchResultsHandler({ query, currentPage }: SearchResultsHandlerProps) {
  
  const [results, setResults] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  useEffect(() => {
    if (query) {
      setHasSearched(true);
      fetchResults(query);
    } else {
      setHasSearched(false);
      setResults([]);
    }
  }, [query, currentPage]);

  async function fetchResults(searchTerm: string) {
    const mockResults = ["Company A", "Company B", "Company C"].filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(mockResults);
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
      ) : results.length > 0 ? (
        <div className="text-center">
          <h2>Search Results for "{query}":</h2>
          <ul className="mt-4">
            {results.map((result, index) => (
              <li key={index} className="text-lg">
                {result}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center text-lg">No results found for "{query}".</p>
      )}
    </div>
  );
}
