import { FetchSamData, getUsername, getFavorites, getRiskScore, verifyUser } from "@/app/lib/data";
import { QRCodeComponent } from "@/components/QR";
import { FavoriteButton } from "@/components/FavoriteButton";
import VerifyButton from "@/components/VerifyButton";
import { RecentOwnership } from "@/components/RecentOwnership";

interface CompanyDetailsProps {
  params: { uei: string };
}

interface FormerName {
  name: string;
  fromDate: string;
  toDate: string;
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
    const formattedDate = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
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
          <p>Unable to fetch company details at this time. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  if (result.status !== "success") {
    return (
      <div className="flex justify-center mt-6">
        <div className="text-center text-xl text-red-500">
          <h2>Error</h2>
          <p>{result.message || "An unknown error occurred while fetching company details."}</p>
        </div>
      </div>
    );
  }

  // Assume result.company contains fields similar to your SEC page but from SAM data
  // Extract SAM company data; updated to include address_line1 and address_line2
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
    riskScore,
  } = result.company;

  const formatDate = (date: string): string => {
    const formatted = parseDate(date);
    const parsedDate = new Date(formatted);
    return parsedDate.toLocaleDateString("en-US");
  };

  // Authentication & favorites as in your SEC page
  const { username } = await getUsername();


  return (
    <div>
      <div className="flex mt-6">
        {/* Left side */}
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
          {/* Additional components: RecentOwnership, QRCode, Favorite, Verify (if reviewer) */}
        </div>
        {/* Right side */}
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
