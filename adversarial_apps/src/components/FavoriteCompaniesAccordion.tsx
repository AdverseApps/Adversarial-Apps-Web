'use client';
import { useState } from "react";
import { QRCodeComponent } from "./QR";
import Image from "next/image";
import Link from "next/link";

interface SECCompany {
  name?: string;
  address?: string;
  street2?: string;
  city?: string;
  zipCode?: string;
  stateOrCountryDescription?: string;
  stateOfIncorporation?: string;
  mostRecentFilingDate?: string;
  phone?: string;
}

interface SAMCompany {
  company_name: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_or_province?: string;
  zip_code?: string;
  country_code?: string;
  registration_date?: string;
  expiration_date?: string;
}

interface FavoriteCompanyProps {
  identifier: string;
  company: SECCompany | SAMCompany;
  source: "SEC" | "SAM";
  username: string;
  riskScore: number | string | null;
}

// function for handling when the user clicks 'add to favorites' button
const RemoveFavorite = ({
  username,
  identifier,
  source,
  companyName,
}: {
  username: string;
  identifier: string;
  source: "SEC" | "SAM";
  companyName: string;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemoveFavorite = async () => {
    try {
      const response = await fetch("/api/call-python-api", {
        method: "POST",
        body: JSON.stringify({
          action: "add_remove_favorite",
          username,
          identifier,
          source,
        }),
      });

      if (response.ok) {
        console.log("Removed Successfully");
        setIsModalOpen(false); // Close modal after successful removal
        window.location.reload(); // refreshing page
      }
    } catch (error) {
      console.error("Error adding/removing favorite:", error);
    }
  };

  return (
    <>
      {/* Remove Favorite Button */}
      <button className="p-1" onClick={() => setIsModalOpen(true)}>
        <Image
          src={"/FilledStar.png"}
          alt="Favorite Icon"
          width={30}
          height={20}
        />
      </button>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div
            className="bg-white p-4 rounded-lg flex flex-col items-center z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-black pb-2 text-center">
              Are you sure you want to remove {companyName} from your favorites?
            </p>
            <div className="flex space-x-4">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                onClick={handleRemoveFavorite}
              >
                Yes, Remove
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Component for displaying favorites
export const FavoriteCompaniesAccordion = ({
  identifier,
  company,
  source,
  username,
  riskScore,
}: FavoriteCompanyProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  // Stopping accordion from opening when QR is clicked
  const handleQRCodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Formatting address based on company type
  const formattedAddress =
    source === "SEC"
      ? `${(company as SECCompany).address || "N/A"}${
          (company as SECCompany).street2
            ? `, ${(company as SECCompany).street2}`
            : ""
        }, ${(company as SECCompany).city || "N/A"}, ${
          (company as SECCompany).stateOrCountryDescription || "N/A"
        } ${(company as SECCompany).zipCode || "N/A"}`
      : `${(company as SAMCompany).address_line1 || "N/A"}${
          (company as SAMCompany).address_line2
            ? `, ${(company as SAMCompany).address_line2}`
            : ""
        }, ${(company as SAMCompany).city || "N/A"}, ${
          (company as SAMCompany).state_or_province || "N/A"
        } ${(company as SAMCompany).zip_code || "N/A"}`;

  // Generating link based on company type
  const moreInfoLink =
    source === "SEC" ? `/company/${identifier}` : `/company/sam/${identifier}`;

  const companyName =
    source === "SEC"
      ? (company as SECCompany).name || "Unknown Company"
      : (company as SAMCompany).company_name || "Unknown Entity";
  return (
    <div className="mb-2 border border-gray-500 rounded-lg overflow-visible">
      {/* Accordion Header */}
      <div
        className="rounded-lg focus-visible:ring-blue-500 focus-visible:ring-12 focus-visible:ring-offset-4 w-full 
                bg-blue-900 p-4 flex justify-between items-center place-items-center text-white font-semibold 
                cursor-pointer grid grid-cols-6 gap-2"
        onClick={toggleAccordion}
        tabIndex={0} // Makes the div tabbable
        role="button" // Tells screen readers it's interactive
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            toggleAccordion(); // Open/close on Enter or Space
          }
        }}
      >
        <span className="justify-self-start">{isOpen ? "▲" : "▼"}</span>
        <span>{companyName || "Unknown Company"}</span>
        {riskScore !== -1 ? (
          <Image
            src={"/check.png"}
            alt="Verified Company"
            width={30}
            height={20}
          />
        ) : (
          <div></div>
        )}
        <span>{riskScore === -1 ? "Unverified" : riskScore}</span>
        <div onClick={handleQRCodeClick} className="cursor-pointer text-white">
          <RemoveFavorite
            username={username}
            identifier={identifier}
            source={source}
            companyName={companyName}
          />
        </div>
        <div onClick={handleQRCodeClick} className="cursor-pointer text-white">
          <QRCodeComponent
            companyName={companyName}
            identifier={identifier}
            source={source}
            displayIconOnly={true}
          />
        </div>
        </div>
        {/* Accordion Content */}
        {isOpen && (
          <div className="p-4 bg-blue-950 text-white rounded-lg rounded-t-none">
            <p>
              <strong>Identifier: </strong>
              {identifier}
            </p>
            <p>
              <strong>Address:</strong> {formattedAddress}
            </p>
            {source === "SAM" && (
              <>
                <p>
                  <strong>Country:</strong>{" "}
                  {(company as SAMCompany).country_code || "N/A"}
                </p>
                <p>
                  <strong>Registration Date:</strong>{" "}
                  {(company as SAMCompany).registration_date || "N/A"}
                </p>
                <p>
                  <strong>Expiration Date:</strong>{" "}
                  {(company as SAMCompany).expiration_date || "N/A"}
                </p>
              </>
            )}
            {source === "SEC" && (
              <>
                <p>
                  <strong>State of Incorporation:</strong>{" "}
                  {(company as SECCompany).stateOfIncorporation || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  {(company as SECCompany).phone || "N/A"}
                </p>
                <p>
                  <strong>Most Recent Filing Date:</strong>{" "}
                  {(company as SECCompany).mostRecentFilingDate || "N/A"}
                </p>
              </>
            )}

            <Link href={moreInfoLink} target="_blank">
              <div className="mt-2 inline-flex items-center bg-blue-600 hover:bg-blue-800 font-semibold py-2 px-4 rounded transition duration-300 ease-in-out">
                More Info
                <Image
                  src="/more.png"
                  height={30}
                  width={30}
                  alt="More"
                  className="invert ml-2"
                />
              </div>
            </Link>
          </div>
        )}
      
    </div>
  );
};
