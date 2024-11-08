
import SearchBar from '@/components/searchbar';

import { Suspense } from 'react';

export default function  Page({
    searchParams,
  }: {
    searchParams?: {
      query?: string;
      page?: string;
    };
  }) {
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    return (
        <>
        <main>
            <h1 className={`text-4xl mt-5 ml-6`}>Search</h1>

            
          <nav className="inset-0 flex items-center justify-center mt-9 gap-2 md:mt-8 ">
            <div className="w-2/5 rounded-sm"> 
            <SearchBar placeholder="Search..."  />
            </div>
          </nav>
        <div className="flex justify-center">
        <h3 className="text-left text-lg"><br /><br />Please input company name<br />
        This will pull up a list of related companies<br />
        Results will list <br />Company: <br />Country: <br />DFR14 found:
        </h3>
        </div>
          <nav className="mt-5 flex w-full justify-center">
            {/* <Pagination totalPages={totalPages} /> */}
          </nav>
          </main>
        </>
      );
    }
