"use client";
import { useState } from "react";
import { QRCodeComponent } from "./QR";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
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
  legal_business_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_or_province?: string;
  zip_code?: string;
  country_code?: string;
  registration_date?: string;
  expiration_date?: string;
}

interface ReviewRequestProps {
  identifier: string;
  source: "SEC" | "SAM";
  company: SECCompany | SAMCompany;
  requestCount: number;
}
/*
// Remove request button with modal confirmation
const RemoveRequest = ({ cik, company }: { cik: string; company: string }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRemoveRequest = async () => {
        try {
            const response = await fetch("/api/call-python-api", {
                method: "POST",
                body: JSON.stringify({
                    action: "remove_review_request",
                    cik: cik,
                }),
            });

            if (response.ok) {
                console.log("Removed Successfully");
                setIsModalOpen(false);  // Close modal
                window.location.reload();  // Refresh the page
            }
        } catch (error) {
            console.error("Error removing review request:", error);
        }
    };

    return (
        <>
            {/* Remove Request Button */ /*}/*
            <button className="p-1" onClick={() => setIsModalOpen(true)}>
                <Image src={"/remove.png"} alt="Remove Icon" width={30} height={20} />
            </button>

            {/* Confirmation Modal */ /*}/*
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div
                        className="bg-white p-4 rounded-lg flex flex-col items-center z-50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-black pb-2 text-center">
                            Are you sure you want to remove the review request for {company}?
                        </p>
                        <div className="flex space-x-4">
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                                onClick={handleRemoveRequest}
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
*/
/*

// Component for displaying review requests in a row format
export const ReviewRequestsAccordion = ({ cik, company, username, requestCount }: ReviewRequestProps) => {
    return (
        <div className="w-full text-lg pb-4 flex justify-between items-center place-items-center text-white font-semibold grid grid-cols-6 gap-2 border-b border-gray-600">
            <span>{company?.name || "Unknown Company"}</span>
            <span>{company?.stateOfIncorporation || "N/A"}</span>
            <span>{requestCount}</span>
            
            <div className="flex justify-center">
                <RemoveRequest cik={cik} company={company.name || "this company"} />
            </div>
            
            <div className="flex justify-center">
                <QRCodeComponent companyName={company.name || ''} cik={cik} displayIconOnly={true} />
            </div>
            
            <div className="flex justify-center">
                <a href={`/company/${cik}`} target="_blank">
                    <div className="inline-flex items-center bg-blue-600 hover:bg-blue-800 font-semibold py-2 px-4 rounded transition duration-300 ease-in-out">
                        More Info
                        <Image src="/more.png" height={30} width={30} alt="More" className="invert ml-2" />
                    </div>
                </a>
            </div>
        </div>
    );
};
*/

// Component for displaying review requests in an accordion format
export const ReviewRequestsAccordion = ({
  identifier,
  source,
  company,
  requestCount,
}: ReviewRequestProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const handleQRCodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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

  const moreInfoLink =
    source === "SEC" ? `/company/${identifier}` : `/company/sam/${identifier}`;

  const companyName =
    source === "SEC"
      ? (company as SECCompany).name || "Unknown Company"
      : (company as SAMCompany).legal_business_name || "Unknown Entity";

  const handleRemoveRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/call-python-api", {
        method: "POST",
        body: JSON.stringify({
          action: "remove_all_review_requests",
          identifier,
          source,
        }),
      });

      if (response.ok) {
        console.log("Removed Successfully");
        setIsModalOpen(false); // Close modal
        window.location.reload(); // Refresh the page
      }

      const result = await response.json();

      if (result.status !== "success") {
        toast.error(
          `Error Removing Requests: ${result.message || result.error}`
        );
        return;
      }
      // Optionally refresh or provide feedback
      toast.success(result.message || "Company Requests Removed successfully!");
      router.refresh();
    } catch (error) {
      console.error("Removal error:", error);
      toast.error(
        "Error Removing company Company Requests. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-2 border border-gray-500 rounded-lg overflow-visible">
      {/* Accordion Header */}
      <div
        className="rounded-lg focus-visible:ring-blue-500 focus-visible:ring-12 focus-visible:ring-offset-4 w-full 
                bg-blue-900 p-4 flex justify-between items-center place-items-center text-white font-semibold 
                cursor-pointer grid grid-cols-6 gap-2"
        onClick={toggleAccordion}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            toggleAccordion();
          }
        }}
      >
        <span className="justify-self-start">{isOpen ? "▲" : "▼"}</span>
        <span>{companyName}</span>
        <span>{requestCount}</span>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={loading}
          className={`bg-blue-600 hover:bg-blue-800 font-semibold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Removing..." : "Remove Company Requests"}
        </button>
        <div onClick={handleQRCodeClick}>
          <QRCodeComponent
            companyName={companyName}
            identifier={identifier}
            source={source}
            displayIconOnly={true}
          />
        </div>
        <div>
          <Link href={moreInfoLink} target="_blank">
            <div className="bg-blue-600 hover:bg-blue-800 font-semibold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center">
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
      </div>
      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 bg-blue-950 rounded-lg rounded-t-none">
          <p>
            <strong>Identifier:</strong> {identifier}
          </p>
          <p>
            <strong>Source:</strong> {source}
          </p>
          <p>
            <strong>Address:</strong> {formattedAddress}
          </p>
          {source === "SEC" && (
            <>
              <p>
                <strong>State of Incorporation:</strong>{" "}
                {(company as SECCompany).stateOfIncorporation || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {(company as SECCompany).phone || "N/A"}
              </p>
              <p>
                <strong>Most Recent Filing Date:</strong>{" "}
                {(company as SECCompany).mostRecentFilingDate || "N/A"}
              </p>
            </>
          )}
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
        </div>
      )}

      {/* Confirmation Modal  */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div
            className="bg-gray-600 p-4 rounded-lg flex flex-col items-center z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="pb-2 text-center">
              Are you sure you want to remove the review request for{" "}
              {companyName}?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleRemoveRequest}
                className={`bg-red-600 hover:bg-red-800 font-semibold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Removing..." : "Yes, Remove"}
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
    </div>
  );
};
