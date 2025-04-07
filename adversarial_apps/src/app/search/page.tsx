import SearchBar from "@/components/searchbar";
import { ReviewedCompaniesTable } from "@/components/ReviewedCompaniesTable";
import { getReviewedCompanies } from "../lib/data";

interface ReviewedCompany {
  cik: string;
  riskScore: number | null;
  lastVerified: string | null;
  entityName: string;
}

interface ApiResponse {
  status: 'success' | 'error';
  reviewedCompanies?: ReviewedCompany[];
  message?: string;
}

export default async function Page() {
  const companiesData: ApiResponse = await getReviewedCompanies();

  return (
    <>
      <main aria-label="main-content">
        <h1 className="text-4xl mt-12 ml-6 text-center">
          Search Company Information
        </h1>
        <nav className="flex items-center justify-center mt-9 gap-2 md:mt-8">
          <div className="w-2/5 rounded-sm">
            <SearchBar placeholder="Search for company names..." />
          </div>
        </nav>

        <section className="mt-6 mx-6 text-center">
          <p className="text-lg mb-4">
            Enter a company name above to search for detailed company
            information from SEC filings and SAM.gov website.
          </p>
          <p className="text-lg mt-4">
            <strong>Note:</strong> For best results, please log in or sign up to
            access all features.
          </p>

          <div className="text-md mt-4">
            <p><u>We do not track user searches with this tool.</u> We value user privacy and will not save anything without your permission. We only store</p>
            <p>user data for login credentials and user-favorited companies. For website demonstration inquiries, please email: adversarialapps@gmail.com</p>
          </div>
        </section>
        <div className="flex justify-center mt-4 mb-64">
          {companiesData.status === 'success' && companiesData.reviewedCompanies ? (
            <ReviewedCompaniesTable reviewedCompanies={companiesData.reviewedCompanies} />
          ) : companiesData.status === 'error' ? (
            <p>Error fetching data: {companiesData.message}</p>
          ) : (
            <p>Loading reviewed companies...</p>
          )}
        </div>

        {/* if we still want to show full-page results after submission, add that section here */}
        {/*
        {query && (
          <div className="flex justify-center mt-6">
            <p className="text-center text-xl">Showing full search results for: {query}</p>
            You can add a component here to display detailed results if needed
          </div>
        )}
        */}
      </main>
    </>
  );
}
