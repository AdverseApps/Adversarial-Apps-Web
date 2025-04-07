import {
  getUsername,
  getFavorites,
  verifyUser,
  FetchSamData,
} from "@/app/lib/data";
import { QRCodeComponent } from "@/components/QR";
import { FavoriteButton } from "@/components/FavoriteButton";
import UpdateCompany from "@/components/UpdateCompany";
import { RiskScoreMeter } from "@/components/RiskScoreMeter";
import RiskScoreTooltip from "@/components/RiskScoreTooltip";
import RequestReviewButton from "@/components/RequestReviewButton";
import { RiskScoreExplanation } from "@/components/RiskScoreExplanation";
import SAMInfo from "@/components/SAMInfo";
interface CompanyDetailsProps {
  params: { uei: string };
}

function capitalizeWords(input: string | null | undefined): string {
  if (!input) return "";
  return input.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseDate(dateString: string) {
  // Ensure the input is an 8-character string
  if (dateString.length !== 8) {
    return new Date(NaN); // Invalid Date
  }
  // Insert hyphens to match the YYYY-MM-DD format
  const formattedDate = `${dateString.slice(0, 4)}-${dateString.slice(
    4,
    6
  )}-${dateString.slice(6, 8)}`;
  return new Date(formattedDate);
}

export default async function Page({ params }: CompanyDetailsProps) {
  const { uei } = params;

  let result;
  try {
    // Fetch SAM data; you'll need to implement FetchSamData to query your PostgreSQL table containing SAM subset data
    result = await FetchSamData(uei);
    if (!result || typeof result !== "object") {
      throw new Error("Invalid response from FetchSamData.");
    }
  } catch (error) {
    console.error("Error in FetchSamData:", error);
    return (
      <div className="flex justify-center mt-6">
        <div className="text-center text-xl text-red-500">
          <h2>Error</h2>
          <p>
            Unable to fetch company details at this time. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (result.status !== "success") {
    return (
      <div className="flex justify-center mt-6">
        <div className="text-center text-xl text-red-500">
          <h2>Error</h2>
          <p>
            {result.message ||
              "An unknown error occurred while fetching company details."}
          </p>
        </div>
      </div>
    );
  }

  let reviewerData;
  try {
    reviewerData = await verifyUser();
    if (!reviewerData || typeof reviewerData !== "object") {
      throw new Error("Invalid response from VerifyReviewer.");
    }
  } catch (error) {
    console.error("Error in verifying user:", error);
  }

  // Extract SAM company data
  const {
    company_name,
    cage_code,
    country_code,
    state_or_province,
    city,
    zip_code,
    address_line1,
    address_line2,
    registration_date,
    expiration_date,
    // riskScore removed since it's no longer used
  } = result.company;

  function capitalizeWords(input: string | null | undefined): string {
    if (!input) return "";
    return input.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function parseDate(dateString: string) {
    if (dateString.length !== 8) {
      return new Date(NaN);
    }
    const formattedDate = `${dateString.slice(0, 4)}-${dateString.slice(
      4,
      6
    )}-${dateString.slice(6, 8)}`;
    return new Date(formattedDate);
  }

  const formatDate = (date: string): string => {
    const formatted = parseDate(date);
    return formatted.toLocaleDateString("en-US");
  };

  // Authentication & favorites
  const { username } = await getUsername();
  const { favorites } = await getFavorites(username);

  // Determine if the company is active based on the expiration date
  const isActive =
    expiration_date && parseDate('20250407') > new Date();

  return (
    <div className="text-white min-h-screen p-8 box-border">
      <div className="flex flex-wrap gap-6 mt-6 box-border">
        {/* Left Side (Company Info) */}
        <div className="w-full md:w-[calc(50%-1.5rem)] bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-navy-600 box-border">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-navy-300 mb-4 max-w-[65%]">
              {capitalizeWords(company_name) || "N/A"}
            </h2>
            <div className="flex items-center space-x-2">
              <QRCodeComponent
                companyName={company_name}
                identifier={uei}
                source="SAM"
                displayIconOnly={false}
              />
              <FavoriteButton
                identifier={uei}
                source="SAM"
                username={username}
                favorites={favorites || []}
                entityName={company_name}
              />
            </div>
          </div>

          {/* Company Info */}
          <div className="mt-6 text-gray-300">
            <p>
              <span className="font-semibold">CAGE Code:</span>{" "}
              {cage_code || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Business Address:</span>{" "}
              {capitalizeWords(address_line1)}
              {address_line2 ? `, ${capitalizeWords(address_line2)}` : ""},{" "}
              {capitalizeWords(city)}, {state_or_province}, {zip_code}
            </p>
            <p>
              <span className="font-semibold">Country Code:</span>{" "}
              {country_code || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Registration Date:</span>{" "}
              {registration_date ? formatDate(registration_date) : "N/A"}
            </p>
            <p>
              <span className="font-semibold">Expiration Date:</span>{" "}
              {expiration_date ? formatDate(expiration_date) : "N/A"}{" "}
              <SAMInfo />
            </p>
          </div>
        </div>

        {/* Right Side (Risk Score) */}
        <div className="w-full md:w-1/2 bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-white text-center box-border">
          <div className="flex items-center gap-2 relative">
            <h2 className="text-3xl font-bold text-navy-300">Status</h2>
          </div>
          <div className="mt-4 flex flex-col items-center">
            {isActive ? (
              <>
                <span className="text-green-500 text-5xl">&#10003;</span>
                <p className="mt-2">Sam Compliant</p>
              </>
            ) : (
              <>
                <span className="text-red-500 text-5xl">&#x2717;</span>
                <p className="mt-2">Expired</p>
              </>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-sm">
        <p>
          Company data is provided by the official U.S. System for Award
          Management.
        </p>
      </footer>
    </div>
  );

  {
    /*
     <div>
       <div className="flex mt-6">
         {/* Left side */
    /*} 
         <div className="w-1/2 text-left text-xl p-6 rounded-lg shadow-md">
           <h2 className="text-2xl font-bold mb-4">{capitalizeWords(company_name) || "N/A"}</h2>
           <br />
           <p>
             <span className="font-semibold">CAGE Code:</span> {cage_code || "N/A"}
           </p>
           <br />
           <p>
             <span className="font-semibold">Business Address:</span>{" "}
             {address_line1 && `${capitalizeWords(address_line1)}, `}{address_line2 && `${capitalizeWords(address_line2)}, `}{capitalizeWords(city)}, {state_or_province}, {zip_code}
           </p>
           <br />
           <p>
             <span className="font-semibold">Country Code:</span> {country_code || "N/A"}
           </p>
           <br />
           <p>
             <span className="font-semibold">Registration Date:</span> {registration_date ? formatDate(registration_date) : "N/A"}
           </p>
           <br />
           {expiration_date && (
             <p>
               <span className="font-semibold">Expiration Date:</span> {formatDate(expiration_date)}
             </p>
           )}
           <br />
           {/* Additional components: RecentOwnership, QRCode, Favorite, Verify (if reviewer) */
    /*}
         </div>
         {/* Right side */
    /*}
         <div className="w-1/2 text-right text-xl p-6 rounded-lg shadow-md">
           <h2 className="text-2xl font-bold mb-4">Risk Report Feature Coming Soon!</h2>
           {result.company.riskScore !== undefined && result.company.riskScore !== null ? (
             <p>
               <span className="font-semibold">Risk Score:</span> {result.company.riskScore}
             </p>
           ) : (
             <p>This Company has not yet been verified</p>
           )}
         </div>
       </div>
       <footer>
         <p>Company data is provided by the official U.S. System for Award Management.</p>
       </footer>
     </div>
   );
 }

 */
  }
}
