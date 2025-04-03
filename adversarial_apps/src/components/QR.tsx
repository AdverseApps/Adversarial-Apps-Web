'use client';
import { useState } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";

interface QRCodeProps {
  companyName: string;
  identifier: string;         // CIK for SEC or entity_id for SAM
  source: "SEC" | "SAM";  // Company type
  displayIconOnly?: boolean;
}

export const QRCodeComponent = (props: QRCodeProps) => {
  const { identifier, companyName, source, displayIconOnly } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Generate different URLs for SEC and SAM companies
  const getCompanyUrl = () => {
    if (source === "SEC") {
      return `https://adversarialapps.com/company/${identifier}`;
    } else if (source === "SAM") {
      return `https://adversarialapps.com/company/sam/${identifier}`;
    }
    return "#";
  };

  return (
    <>
      {displayIconOnly ? (
        // If displayIconOnly is true, render only the image as a button
        <button onClick={openModal} className="p-1">
          <Image
            src="/QRCodeIcon.png"
            alt="QR Code Icon"
            width={30}
            height={30}
            className="cursor-pointer invert"
          />
        </button>
      ) : (
        // Full button with text and image
        <button
          onClick={openModal}
          className="px-4 py-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors flex items-center space-x-2 mt-2"
        >
          <Image
            src="/QRCodeIcon.png"
            alt="QR Code Icon"
            width={30}
            height={30}
            className="invert"
          />
        </button>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center resize-none z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-4 rounded-lg flex flex-col items-center z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center break-words">
              <p className="text-black pb-2 text-center break-words max-w-full">{companyName}</p>
              <QRCode value={getCompanyUrl()} className="rounded-lg" />
            </div>
            <button className="bg-black text-white px-3 py-1 mt-4 rounded hover:bg-gray-800 transition-colors 
              focus-visible:ring-blue-500 focus-visible:ring-4 focus-visible:ring-offset-4" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};
