"use client";
import { useState } from "react";
import { QRCodeComponent } from "./QR";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

interface Company {
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

interface ReviewRequestProps {
  cik: string;
  company: Company;
  username: string;
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
  cik,
  company,
  username,
  requestCount,
}: ReviewRequestProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const handleQRCodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const formattedAddress = company
    ? `${company.address || "N/A"}${
        company.street2 ? `, ${company.street2}` : ""
      }, ${company.city || "N/A"}, ${
        company.stateOrCountryDescription || "N/A"
      } ${company.zipCode || "N/A"}`
    : "N/A";
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRemoveRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/call-python-api", {
        method: "POST",
        body: JSON.stringify({
          action: "remove_all_review_requests",
          cik: cik,
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
        <span>{company?.name || "Unknown Company"}</span>
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
        <div onClick={handleQRCodeClick} className="cursor-pointer text-white">
          <QRCodeComponent
            companyName={company.name || ""}
            cik={cik}
            displayIconOnly={true}
          />
        </div>
        <Link href={`/company/${cik}`} target="_blank">
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

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 bg-blue-950 rounded-lg rounded-t-none">
          <p>
            <strong>CIK:</strong> {cik}
          </p>
          <p>
            <strong>Address:</strong> {formattedAddress}
          </p>
          <p>
            <strong>Phone:</strong> {company?.phone || "N/A"}
          </p>
          <p>
            <strong>Most Recent Filing Date:</strong>{" "}
            {company?.mostRecentFilingDate || "N/A"}
          </p>
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
              {company.name}?
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
