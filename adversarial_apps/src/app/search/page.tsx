import SearchBar from '@/components/searchbar';
import SearchResultsHandler from '@/components/SearchResultsHandler';

export default function  Page({
    searchParams,
  }: {
    searchParams?: {
      query?: string;
      cik?: string;
      page?: string;
    };
  }) {
    const query = searchParams?.query || '';
    const cik = searchParams?.cik || '';
    const currentPage = Number(searchParams?.page) || 1; //for whenever pagination is added

    return (
        <>
        <main>
            <h1 className={`text-4xl mt-12 ml-6 text-center`}>Search</h1>

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
           <SearchResultsHandler query={query} cik={cik} currentPage={currentPage} />
          </main>
        </>
      );
    }
