import {
  FetchSecData,
  getUsername,
  getFavorites,
  getRiskScore,
  verifyUser,
  getTotalCommonStocks,
  getDefUrl,
} from "@/app/lib/data";
import { QRCodeComponent } from "@/components/QR";
import { FavoriteButton } from "@/components/FavoriteButton";
import VerifyButton from "@/components/VerifyButton";
import UpdateCompany from "@/components/UpdateCompany";
import { RecentOwnership } from '@/components/RecentOwnership';
import { RiskScoreMeter } from "@/components/RiskScoreMeter";
import RiskScoreTooltip from "@/components/RiskScoreTooltip";

import RequestReviewButton from '@/components/RequestReviewButton';

interface CompanyDetailsProps {
  params: { cik: string };
}

interface FormerName {
  name: string;
  fromDate: string;
  toDate: string;
}

function capitalizeWords(input: string | null | undefined): string {
  if (!input) {
    return ""; // Return an empty string if input is null or undefined
  }
  return input.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function page({ params }: CompanyDetailsProps) {
  const { cik } = params;

  let result;
  try {
    result = await FetchSecData(cik);

    if (!result || typeof result !== "object") {
      throw new Error("Invalid response from FetchSecData.");
    }
  } catch (error) {
    console.error("Error in FetchSecData:", error);
    return (
      <div className="flex justify-center mt-6">
        <div className="text-center text-xl text-red-500">
          <h2>Error</h2>
          <p>
            Unable to fetch company details at this time. Please try again
            later.
          </p>
        </div>
      </div>
    );
  }
  // If fetching failed, handle the error
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

  let riskScore;
  try {
    console.log(cik);
    riskScore = await getRiskScore(cik);

    if (!riskScore || typeof riskScore !== "object") {
      throw new Error("Invalid response from GetRiskScore.");
    }
  } catch (error) {
    console.error("Error in getting risk score:", error);
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

  // Only if the user is a reviewer, fetch additional SEC data.
  interface TotalCommonStocksResponse {
    status: "success" | "error";
    totalCommonStocks?: number;
    message?: string;
  }

  interface DefUrlResponse {
    status: "success" | "error";
    url?: string;
    message?: string;
  }
  let totalCommonStocks: TotalCommonStocksResponse | null = null;
  let defUrl: DefUrlResponse | null = null;
  if (reviewerData && reviewerData.role === "true") {
    try {
      totalCommonStocks = await getTotalCommonStocks(cik);
    } catch (error) {
      console.error("Error fetching total common stocks:", error);
    }
    try {
      defUrl = await getDefUrl(cik);
    } catch (error) {
      console.error("Error fetching DEF 14A URL:", error);
    }
  }

  const {
    name,
    formerNames,
    address,
    street2,
    city,
    zipCode,
    stateOrCountryDescription,
    stateOfIncorporation,
    mostRecentFilingDate,
    phone,
    website,
  } = result.company;

  const formatDate = (date: string): string => {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString("en-US"); // Format: MM/DD/YYYY
  };

  // Checking authentication and favorites
  const { username } = await getUsername();
  const { favorites } = await getFavorites(username);
  console.log(username);
  console.log(favorites);
  // *** Server-side check for reviewer role ***

  // reviewerData will be an object { username, role } or null
  return (
    <div className="text-white min-h-screen p-8 box-border">
      <div className="flex flex-wrap gap-6 mt-6 box-border">
        {/* Left side (Company Information) */}
        <div className="w-full md:w-[calc(50%-1.5rem)] bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-navy-600 box-border">
          <div className="flex items-center justify-between"> {/* Add flex container */}
            <h2 className="text-3xl font-bold text-navy-300 mb-4 max-w-[65%]">
              {capitalizeWords(name) || "N/A"}
            </h2>
            <div className="flex items-center space-x-2"> {/* Wrap buttons */}
              <QRCodeComponent companyName={name} cik={cik} displayIconOnly={false} />
              <FavoriteButton cik={cik} username={username} favorites={favorites} />
            </div>
          </div>

          {/* Former Names */}
          {formerNames && formerNames.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-300">Former Names:</h3>
              <ul className="list-disc pl-5 text-gray-400">
                {formerNames.map((item: FormerName, index: number) => (
                  <li key={index} className="mt-1">
                    <span className="font-medium text-gray-100">
                      {capitalizeWords(item.name)}
                    </span>{" "}
                    (From: {formatDate(item.fromDate)} To: {formatDate(item.toDate)})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Company Info */}
          <div className="mt-6 text-gray-300">
            <p><span className="font-semibold">Business Address:</span> {capitalizeWords(address)?.replace(/,+$/, "") || "N/A"}
              {street2 && `, ${capitalizeWords(street2).replace(/,+$/, "")}`}
              {city && `, ${capitalizeWords(city).replace(/,+$/, "")}`}
              {zipCode && `, ${zipCode}`}
            </p>

            <p className="mt-2"><span className="font-semibold">State or Country:</span> {stateOrCountryDescription || "N/A"}</p>
            <p className="mt-2"><span className="font-semibold">State of Incorporation:</span> {stateOfIncorporation || "N/A"}</p>
            <p className="mt-2"><span className="font-semibold">Date of Last Filing:</span> {mostRecentFilingDate ? formatDate(mostRecentFilingDate) : "N/A"}</p>
            <p className="mt-2"><span className="font-semibold">Phone:</span> {phone || "N/A"}</p>

            {/* Website Link */}
            <p className="mt-2">
              <span className="font-semibold">Website:</span>{" "}
              {website ? (
                <div>
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy-400 font-medium hover:text-navy-500 underline"
                  >
                    {website}
                  </a>
                  <p className="text-xs text-gray-500 mt-1">
                    Please note we do not verify any external website linked on this page, click on links at your own risk.
                  </p>
                </div>
              ) : "N/A"}
            </p>
          </div>
        </div>

        {/* Right side (Risk Score) */}
        <div className="w-full md:w-1/2 bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-white text-center box-border">
          {/* Risk Score Hover Information */}
          <div className="flex items-center gap-2 relative">
            <h2 className="text-3xl font-bold text-navy-300">Risk Score</h2>
            <RiskScoreTooltip />
          </div>
          {/* Displaying risk score */}
          {riskScore.riskScore !== undefined && riskScore.riskScore !== null ? (
            <div>
              <RiskScoreMeter riskScore={riskScore.riskScore} />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <p>This Company has not yet been verified</p>
              <RequestReviewButton cik={cik} username={username || null} role={reviewerData?.role || null} />
            </div>
          )}

          {/* Report Summary (goes below this comment once functionality is made) */}

          {/* Only display additional SEC API data for reviewer users */}
          {reviewerData && reviewerData.role === "true" && (
            <div className="mt-4 text-left">
              <h3 className="text-xl font-bold mb-2">Additional SEC Data</h3>
              <p>
                <span className="font-semibold">Total Common Stocks:</span>{" "}
                {totalCommonStocks ? (
                  totalCommonStocks.status === "success" ? (
                    totalCommonStocks.totalCommonStocks
                  ) : (
                    totalCommonStocks.message
                  )
                ) : (
                  "N/A"
                )}
              </p>
              <p>
                <span className="font-semibold">DEF 14A URL:</span>{" "}
                {defUrl ? (
                  defUrl.status === "success" ? (
                    <a
                      href={defUrl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {defUrl.url}
                    </a>
                  ) : (
                    defUrl.message
                  )
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          )}
          {/* Render the "Verify Company" button only if user is a reviewer */}
          {reviewerData && reviewerData.role === "true" && (
            <div className="mt-4">
              <VerifyButton cik={cik} />
            </div>
          )}
          {reviewerData && reviewerData.role === "true" && (
            <UpdateCompany cik={cik} />
          )}
        </div>
      </div>

      <div className="w-full mt-6 bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-white">
        <RecentOwnership cik={cik} />
      </div>

      <footer className="mt-12 text-center text-sm">
        {/* Properly Citing the SEC*/}
        <p>
          Company filing and financial data is provided by the U.S. Securities
          and Exchange Commission&apos;s EDGAR database{" "}
        </p>
      </footer>
    </div>
  );
}
