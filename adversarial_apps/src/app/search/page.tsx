import SearchBar from "@/components/searchbar";

export default function Page() {

  return (
    <>
      <main aria-label="main-content">
        <h1 className="text-4xl mt-12 ml-6 text-center">
          Search Company Information
        </h1>

        <section className="mt-6 mx-6 text-center">
          <p className="text-lg mb-4">
            Enter a company name below to search for detailed company
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
            <strong>User Benefits:</strong>
          </p>
          <p className="text-lg">
            <strong>Logged In:</strong> Once you log in, you can access
            additional features on the company page, including saving favorites
            and requesting a review of the company. This enhanced view gives you
            complete, up-to-date information and interactive tools to help
            manage your company research.
          </p>
          <p className="text-lg mt-4">
            <strong>Note:</strong> For best results, please log in or sign up to
            access all features.
          </p>
        </section>

        <nav className="flex items-center justify-center mt-9 gap-2 md:mt-8">
          <div className="w-2/5 rounded-sm">
            <SearchBar placeholder="Search for company names..." />
          </div>
        </nav>

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
