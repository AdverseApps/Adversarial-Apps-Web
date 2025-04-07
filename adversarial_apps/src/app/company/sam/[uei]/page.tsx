import {
  getUsername,
  getFavorites,
  verifyUser,
  FetchSamData,
} from "@/app/lib/data";
import { QRCodeComponent } from "@/components/QR";
import { FavoriteButton } from "@/components/FavoriteButton";
import SAMInfo from "@/components/SAMInfo";
import { CertsTable } from "@/components/CertsTable";
import Image from "next/image";
import ExclusionsTable from "@/components/ExclusionsTable";

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
            Unable to fetch company details at this time. Please try again
            later.
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
    certifications,
    exclusion_type,
    excluding_agency,
    ex_active_date,
    ex_termination_date,
  } = result.company;

  const formatDate = (date: string): string => {
    const formatted = parseDate(date);
    return formatted.toLocaleDateString("en-US");
  };

  // Authentication & favorites
  const { username } = await getUsername();
  const { favorites } = await getFavorites(username);

  // Determine if the company is active based on the expiration date
  const isActive = parseDate(expiration_date) > new Date();

  return (
    <div className="text-white min-h-screen p-8 box-border">
      <div className="flex flex-wrap gap-6 mt-6 box-border">
        {/* Left Side (Company Info) */}
        <div className="w-full md:w-[calc(50%-1.5rem)] bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-navy-600 box-border">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-navy-300 mb-4 max-w-[65%]">
              {capitalizeWords(company_name) || "N/A"}
            </h2>

            {/* Split div into reviewer/user conditions */}
            {reviewerData && reviewerData.role === "true" && (
              <div className="flex items-center space-x-2">
                {" "}
                {/* Wrap buttons */}
                <QRCodeComponent
                  companyName={company_name}
                  identifier={uei}
                  source="SAM"
                  displayIconOnly={false}
                />
              </div>
            )}
            {reviewerData && reviewerData.role === "false" && (
              <div className="flex items-center space-x-2">
                {" "}
                {/* Wrap buttons */}
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
            )}
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

        {/* Right Side (SAM registration) */}
        <div className="w-full md:w-1/2 bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-white text-center box-border">
          <div className="flex items-center gap-2 relative">
            <h2 className="text-3xl font-bold">SAM Registration Status</h2>
          </div>
          <div className="mt-4 flex flex-col items-center">
            {isActive ? (
              <>
                <Image
                  src="/check.png"
                  width={100}
                  height={100}
                  alt="Check Mark"
                />
                <p className="mt-2">
                  {capitalizeWords(company_name)} is currently registered with
                  SAM.gov. They are eligible to participate in federal
                  contracts, subcontracts, grants, loans, and other federal
                  assistance programs.
                </p>
              </>
            ) : (
              <>
                <Image
                  src="/x-red-circle.png"
                  width={100}
                  height={100}
                  alt="Expired"
                />
                <p className="mt-2">
                  {capitalizeWords(company_name)} is not currently registered
                  with SAM.gov. As a result, they may be ineligible to
                  participate in federal contracts, subcontracts, grants, loans,
                  and other federal assistance programs until registration is
                  completed.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {exclusion_type && (
        <ExclusionsTable
          company_name={capitalizeWords(company_name)}
          exclusion_type={exclusion_type}
          excluding_agency={excluding_agency}
          ex_active_date={ex_active_date}
          ex_termination_date={ex_termination_date}
        />
      )}

      {certifications &&
        <div className="w-full mt-6 bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-white">
          <CertsTable certifications={certifications} />
        </div>
      }

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
