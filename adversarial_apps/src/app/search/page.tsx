import SearchBar from '@/components/searchbar';
import SearchResultsHandler from '@/components/SearchResultsHandler';
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
    const currentPage = Number(searchParams?.page) || 1; //for whenever pagination is added

    return (
        <>
        <main>
            <h1 className={`text-4xl mt-5 ml-6`}>Search</h1>

          {/*search bar*/}
          <nav className="inset-0 flex items-center justify-center mt-9 gap-2 md:mt-8 ">
            <div className="w-2/5 rounded-sm"> 
            <SearchBar placeholder="Search..."  />
            </div>
          </nav>
       
          <nav className="mt-5 flex w-full justify-center">
            {/* <Pagination totalPages={totalPages} /> */}
          </nav>

           {/* Search Results and states handled here */}
      <SearchResultsHandler query={query} currentPage={currentPage} />
          </main>
        </>
      );
    }
