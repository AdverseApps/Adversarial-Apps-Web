'use client';
import Link from "next/link";
import { useState } from "react";

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
  
  interface FavoriteCompanyProps {
    cik: string;
    company: Company;
  }

// Component for displaying favorites
export const UserFavoriteCompanies = ({ cik, company }: FavoriteCompanyProps) => {
     const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const formattedAddress = company
    ? `${company.address || "N/A"}${company.street2 ? `, ${company.street2}` : ""}, ${company.city || "N/A"}, ${company.stateOrCountryDescription || "N/A"} ${company.zipCode || "N/A"}`
    : "N/A";

  return (
    <div className="mb-2 border border-gray-500 rounded-lg overflow-hidden">
      {/* Accordion Header */}
      <button
        className="w-full bg-blue-900 p-4 flex justify-between items-center text-white font-semibold"
        onClick={toggleAccordion}
      >
        <span>{company?.name || "Unknown Company"}</span>
        <span>{isOpen ? "▲" : "▼"}</span>
        
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 bg-blue-800 text-white">
          <p><strong>CIK:</strong> {cik}</p>
          <p><strong>Address:</strong> {formattedAddress}</p>
          <p><strong>State of Incorporation:</strong> {company?.stateOfIncorporation || "N/A"}</p>
          <p><strong>Phone:</strong> {company?.phone || "N/A"}</p>
          <p><strong>Most Recent Filing Date:</strong> {company?.mostRecentFilingDate || "N/A"}</p>
        </div>
      )}
    </div>
  );
}