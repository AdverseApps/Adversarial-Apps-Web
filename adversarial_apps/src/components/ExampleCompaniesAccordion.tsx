'use client';
import { useState } from "react";
import { QRCodeComponent } from "./QR";
import Image from "next/image";
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

interface ExampleCompanyProps {
  cik: string;
  company: Company;
  riskScore: number | null;
}

export const ExampleCompaniesAccordion = ({ cik, company, riskScore }: ExampleCompanyProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const handleQRCodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const formattedAddress = company
    ? `${company.address || "N/A"}${company.street2 ? `, ${company.street2}` : ""}, ${company.city || "N/A"}, ${company.stateOrCountryDescription || "N/A"} ${company.zipCode || "N/A"}`
    : "N/A";

  return (
    <div className="mb-2 border border-gray-500 rounded-lg overflow-visible">
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
        {riskScore !== -1 ? (
          <Image src={"/check.png"} alt="Verified Company" width={30} height={20} />
        ) : (
          <div></div>
        )}
        <span>{riskScore === -1 ? "Unverified" : riskScore}</span>
        <div onClick={handleQRCodeClick} className="cursor-pointer text-white">
          <QRCodeComponent companyName={company.name || ''} cik={cik} displayIconOnly={true} />
        </div>
      </div>

      {isOpen && (
        <div className="p-4 bg-blue-950 text-white rounded-lg rounded-t-none">
          <p><strong>CIK: </strong>{cik}</p>
          <p><strong>Address:</strong> {formattedAddress}</p>
          <p><strong>State of Incorporation:</strong> {company?.stateOfIncorporation || "N/A"}</p>
          <p><strong>Phone:</strong> {company?.phone || "N/A"}</p>
          <p><strong>Most Recent Filing Date:</strong> {company?.mostRecentFilingDate || "N/A"}</p>
          <Link href={`/company/${cik}`} target="_blank">
            <div className="mt-2 inline-flex items-center bg-blue-600 hover:bg-blue-800 font-semibold py-2 px-4 rounded transition duration-300 ease-in-out">
              More Info
              <Image src="/more.png" height={30} width={30} alt="More" className="invert ml-2" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};
