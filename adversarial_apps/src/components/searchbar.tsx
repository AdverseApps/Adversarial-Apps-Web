'use client';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';


export default function SearchBar({placeholder }: {placeholder: string}) {
    
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
  
    function handleSearch(term: string) {
        const params = new URLSearchParams(searchParams);
        if (term) {
          params.set('query', term);
        } else {
          params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
      }
      return (
        <div className="relative flex">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <input
      
            className="block w-full rounded-3xl border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 text-gray-500"
            placeholder={placeholder}
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
            defaultValue={searchParams.get('query')?.toString()}
          />
        </div>
      );
    }
