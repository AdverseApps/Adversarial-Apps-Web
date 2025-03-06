'use client';
import Link from "next/link";
import { useState } from "react";
import { QRCodeComponent } from "./QR";
import Image from "next/image";


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
    username: string;
    riskScore: number | null;
}

// function for handling when the user clicks 'add to favorites' button
const RemoveFavorite = ({ username, cik, company }: { username: string; cik: string, company: string, }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRemoveFavorite = async () => {
        try {
            const response = await fetch("/api/call-python-api", {
                method: "POST",
                body: JSON.stringify({
                    action: "add_remove_favorite",
                    username,
                    cik,
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
                <Image src={"/FilledStar.png"} alt="Favorite Icon" width={30} height={20} />
            </button>

            {/* Confirmation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div
                        className="bg-white p-4 rounded-lg flex flex-col items-center z-50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-black pb-2 text-center">
                            Are you sure you want to remove {company} from your favorites?
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
export const FavoriteCompaniesAccordion = ({ cik, company, username, riskScore }: FavoriteCompanyProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    // Stopping accordion from opening when QR is clicked
    const handleQRCodeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const formattedAddress = company
        ? `${company.address || "N/A"}${company.street2 ? `, ${company.street2}` : ""}, ${company.city || "N/A"}, ${company.stateOrCountryDescription || "N/A"} ${company.zipCode || "N/A"}`
        : "N/A";

    return (
        <div className="mb-2 border border-gray-500 rounded-lg overflow-hidden">
            {/* Accordion Header */}
            <div
                className="w-full bg-blue-900 p-4 flex justify-between items-center place-items-center text-white font-semibold cursor-pointer grid grid-cols-6 gap-2"
                onClick={toggleAccordion}
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
                    <RemoveFavorite username={username} cik={cik} company={company.name || "this company"} />
                </div>
                <div onClick={handleQRCodeClick} className="cursor-pointer text-white">
                    <QRCodeComponent companyName={company.name || ''} cik={cik} displayIconOnly={true} />
                </div>
            </div>

            {/* Accordion Content */}
            {isOpen && (
                <div className="p-4 bg-blue-950 text-white">
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