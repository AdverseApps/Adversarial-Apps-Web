"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

interface CompanyResult {
  name: string;
  identifier: string; // For SEC: CIK; for SAM: UEI
  source: "SEC" | "SAM";
}
interface SAMCompanyAPIResponse {
  company_name: string;
  uei: string;
}
interface SECCompanyAPIResponse {
  "Company Name": string;
  CIK: string;
}
export default function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <Suspense fallback={<div>Loading search bar...</div>}>
      <SearchBarContent placeholder={placeholder} />
    </Suspense>
  );
}

function SearchBarContent({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const replace = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 6;
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        console.log("Searching for:", searchTerm);
        fetchCombinedResults(searchTerm);
        if (currentPage !== 1) {
          setCurrentPage(1);
        }
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300); // Delay of 300ms
    return () => clearTimeout(delayDebounceFn); //debouncing to reduce unnecessary requests to the server
  }, [searchTerm]);

  async function fetchCombinedResults(query: string) {
    try {
      // --- Fetch SEC/EDGAR results
      const secData = { action: "obtain_cik_number", search_term: query };
      const secResponse = await fetch("/api/call-python-api", {
        method: "Post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(secData),
      });

      let secResults: CompanyResult[] = [];
      if (secResponse.status === 200) {
        const secResult = await secResponse.json();
        console.log("SEC Results:", secResult);

        if (Array.isArray(secResult.companies)) {
          secResults = secResult.companies.map(
            (company: SECCompanyAPIResponse) => ({
              name: company["Company Name"] || "Unknown SEC Company",
              identifier: company.CIK,
              source: "SEC" as const,
            })
          );
        }
      }

      // --- Fetch SAM results using SAM search endpoint
      const samData = { action: "sam_search", search_term: query };
      const samResponse = await fetch("/api/call-python-api", {
        method: "Post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(samData),
      });

      let samResults: CompanyResult[] = [];
      if (samResponse.status === 200) {
        const samResult = await samResponse.json();
        console.log("SAM Results:", samResult);

        if (Array.isArray(samResult.results)) {
          samResults = samResult.results.map(
            (company: SAMCompanyAPIResponse) => ({
              name: company.company_name || "Unknown SAM Company",
              identifier: company.uei,
              source: "SAM" as const,
            })
          );
        }
      }

      // Combine results from both sources
      setResults([...secResults, ...samResults]);
    } catch (error) {
      console.error("Error fetching combined results:", error);
      setResults([]);
    }
  }

  /*
     SEC ONLY FETCH
  async function fetchResults(query: string) {

    // Data will hold what will be given in the API body. [query] is what is typed in the box
    console.log("Fetching CIK number...");
    const data = { action: "obtain_cik_number", search_term: query };
    const response = await fetch("/api/call-python-api", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (response.status === 200) {
      const result = await response.json();
      console.log(result);

      const companies = result.companies.map(
        (company: { "Company Name": string; CIK: string }) => ({
          name: company["Company Name"],
          cik: company["CIK"],
        })
      );

      setResults(companies);
      setCurrentPage(1);
    }
  }
 */

  // Called when a user clicks a specific result in the dropdown
  function handleResultClick(result: CompanyResult) {
    // Redirect to the appropriate company details page based on source.
    if (result.source === "SEC") {
      replace.push(`/company/${result.identifier}`);
    } else if (result.source === "SAM") {
      replace.push(`/company/sam/${result.identifier}`);
    }
    setShowDropdown(false);
  }

  function handleSearch(term: string) {
    if (term) {
      replace.push(`/search?query=${term}`);
    }
  }

  function nextPage() {
    if (currentPage * resultsPerPage < results.length) {
      setCurrentPage(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function sanitizeInput(input: string): string {
    // removes special characters like <, >, ".
    return input.replace(/<|>/g, "");
  }

  return (
    // Changing this to just "flex", does not display the results correctly.
    <div className="relative flex">
      <label htmlFor="search" className="sr-only">
        Search
      </label>

      <input
        id="search"
        //className="block w-full rounded-3xl border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 text-gray-500"
        className={`block w-full border border-gray-300 py-2 pl-4 pr-4 text-sm text-gray-500 placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
          showDropdown ? "rounded-t-3xl rounded-b-none" : "rounded-3xl"
        }`}
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(sanitizeInput(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch(e.currentTarget.value);
            setShowDropdown(false); // Hide dropdown on Enter
          }
        }}
        defaultValue={searchParams.get("query")?.toString()}
      />

      {showDropdown && results.length > 0 && (
        <ul
          className="flex-none absolute w-full rounded-b-3xl border border-t-0 border-gray-300 bg-white shadow-lg text-gray-500"
          style={{ top: "100%" }}
        >
          {paginatedResults.map((result, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              tabIndex={0}
              onClick={() => handleResultClick(result)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleResultClick(result);
              }}
            >
              {result.name}{" "}
              <span className="text-xs italic">({result.source})</span>
            </li>
          ))}
          <div className="flex justify-between px-4 py-2 border-t border-gray-300">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="text-sm text-gray-500 disabled:opacity-50"
            >
              &lt; Previous
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage * resultsPerPage >= results.length}
              className="text-sm text-gray-500 disabled:opacity-50"
            >
              Next &gt;
            </button>
          </div>
        </ul>
      )}
    </div>
  );
}
