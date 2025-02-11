'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

export default function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <Suspense fallback={<div>Loading search bar...</div>}>
      <SearchBarContent placeholder={placeholder} />
    </Suspense>
  );
}

function SearchBarContent({ placeholder }: {placeholder: string}) {
    
    const searchParams = useSearchParams();
    const replace = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<{ name: string; cik: string }[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);



    useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        console.log("Searching for:", searchTerm);
        fetchResults(searchTerm);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300); // Delay of 300ms
    return () => clearTimeout(delayDebounceFn); //debouncing to reduce unnecessary requests to the server
    }, [searchTerm]);

    async function fetchResults(query: string) {
      //CAN POSSIBLLY REMOVE FOR THE LIB DATA ADDITION
        // Data will hold what will be given in the API body. [query] is what is typed in the box
        console.log('Fetching CIK number...');
        const data = { action: "obtain_cik_number", search_term: query };
        const response = await fetch('/api/call-python-api', {
          method: 'Post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if (response.status === 200) {
          const result = await response.json();
          console.log(result);
  
          const companies = result.companies.map((company: { "Company Name": string, "CIK": string }) => ({
              name: company["Company Name"],
              cik: company["CIK"]
          }));
          
          setResults(companies);
      }
/*
LIB DATA ATTEMPT, WILL LOOK AT MORE LATER -Dami
      try {
        const companies = await FetchCIKnumber(query); // Fetch data using the imported function
        if (companies) {
          setResults(companies);
        } else {
          setResults([]); // Handle cases where no results are returned
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        setResults([]); // Reset results on error
      }
        */
    }
    

      function handleSearch(term: string) {
        if (term) {
          replace.push(`/search?query=${term}`);
        }
      }
      
      function sanitizeInput(input: string): string {
        // removes special characters like <, >, ".
        return input.replace(/<|>/g, "");
      }

      return (

        <div className="relative flex">
          <label htmlFor="search" className="sr-only">
            Search
          </label>

          <input
            id = "search"
            //className="block w-full rounded-3xl border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 text-gray-500"
            className={`block w-full border border-gray-300 py-2 pl-4 pr-4 text-sm text-gray-500 placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
              showDropdown ? 'rounded-t-3xl rounded-b-none' : 'rounded-3xl'
            }`}
            
            placeholder={placeholder}
            value ={searchTerm}
            onChange={(e) => setSearchTerm(sanitizeInput(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
              handleSearch(e.currentTarget.value);
              setShowDropdown(false); // Hide dropdown on Enter
            }
            }}
            defaultValue={searchParams.get('query')?.toString()}
          />

          {showDropdown && results.length > 0 && (
            <ul className="flex-none absolute w-full rounded-b-3xl border border-t-0 border-gray-300 bg-white shadow-lg text-gray-500"
            style={{ top: '100%' }}>
            {results.map((result, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                tabIndex={0}
                onClick={() => {
                  //REPLACE WITH HAVING THEM REDIRECTED TO RESULTS PAGE FOR THE ENTRY HERE
                  console.log('Redirecting to:', `/company/${result.cik}`); //debugging
                  replace.push(`/company/${result.cik}`);
                  setShowDropdown(false); // Hide dropdown after selection
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    console.log('Redirecting to:', `/company/${result.cik}`); //debugging
                    replace.push(`/company/${result.cik}`);
                    setShowDropdown(false);
                  }}
              }
              >
              {result.name}
              </li>
              ))
            }
            </ul>
            )
          }

        </div>
      );
    }