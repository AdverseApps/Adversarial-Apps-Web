import SearchBar from "@/components/searchbar";
import { getReviewedCompanies } from "../lib/data";

export default async function Page() {

  const companies = await getReviewedCompanies();
  console.log(companies);

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
            information from SEC filings. Your search results will include:
          </p>
          <ul className="list-disc list-inside text-left inline-block">
            <li>
              <strong>Company Name:</strong> The official, formatted name of the
              company.
            </li>
            <li>
              <strong>Business Address:</strong> The primary address, including
              street, city, state/country, and ZIP code.
            </li>
            <li>
              <strong>Former Names:</strong> Any previous names the company has
              used.
            </li>
            <li>
              <strong>Date of Last Filing:</strong> The most recent filing date
              from SEC data.
            </li>
            <li>
              <strong>Risk Score:</strong> For verified companies, a risk score
              is displayed. (If a company isn’t verified, you’ll see a message
              indicating that verification is pending.)
            </li>
          </ul>

          <p className="text-lg mt-4">
            <strong>Note:</strong> For best results, please log in or sign up to
            access all features.
          </p>

          <p className="text-md mt-4">
            <p><u>We do not track user searches with this tool.</u> We value user privacy and will not save anything without your permission. We only store</p>
            <p>user data for login credentials and user-favorited companies. For website demonstration inquiries, please email: adversarialapps@gmail.com</p>
          </p>
        </section>


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
