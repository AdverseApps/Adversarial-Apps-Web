import {
  getUsername,
  getFavorites,
  verifyUser,
  FetchSamData,
} from "@/app/lib/data";
import { QRCodeComponent } from "@/components/QR";
import { FavoriteButton } from "@/components/FavoriteButton";
import SAMInfo from "@/components/SAMInfo";
import Link from "next/link";
import Image from "next/image";

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
    exclusions,
  } = result.company;

  const formatDate = (date: string): string => {
    const formatted = parseDate(date);
    return formatted.toLocaleDateString("en-US");
  };

  // Authentication & favorites
  const { username } = await getUsername();
  const { favorites } = await getFavorites(username);

  // Determine if the company is active based on the expiration date
  const isActive =
    parseDate(expiration_date) > new Date();

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
            <h2 className="text-3xl font-bold">SAM Registration Status</h2>
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
      {exclusions != null && (
        <div className="w-full mt-6 bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-white">
          <div className="flex justify-center items-center">
            <Image
              src="/warning.png"
              width={40}
              height={15}
              alt="Warning"
            />
            <h2 className="text-3xl font-bold mb-2 ml-2">Exclusions</h2>
            <Image
              src="/warning.png"
              width={40}
              height={15}
              alt="Warning"
            />
          </div>

          <p>
            {capitalizeWords(company_name)} has active exclusions that may disqualify them from participating in certain federal contracts, subcontracts, grants, loans, and/or other federal assistance programs.
            Please refer to{' '}
            <Link href="https://sam.gov" passHref legacyBehavior>
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline hover:text-blue-400 transition-colors"
              >
                SAM.gov
              </a>
            </Link> for more information.
          </p>
        </div>
      )}
      <footer className="mt-12 text-center text-sm">
        <p>
          Company data is provided by the official U.S. System for Award
          Management.
        </p>
      </footer>
      {/* Only display additional SEC API data for reviewer users */}
    </div>
  );
}
