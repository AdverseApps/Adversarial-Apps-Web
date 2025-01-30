'use client';
import { useState } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";

interface QRCodeProps {
    companyName: string;
    cik: string;
}

export const QRCodeComponent = (props: QRCodeProps) => {
    const { cik, companyName } = props;

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <button
                onClick={openModal}
                className="px-4 py-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors flex items-center space-x-2 mt-2"
            >
                <p>QR Code</p>
                <Image
                    src="/QRCodeIcon.png"
                    alt="QR Code Icon"
                    width={30}
                    height={30}
                    className="invert"
                />
            </button>

            {isModalOpen && (
                <div
                className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center resize-none"
                onClick={closeModal}
              >
                <div
                  className="bg-white p-4 rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col items-center break-words">
                    <p className="text-black pb-2 text-center break-words max-w-full">{companyName}</p>
                    <QRCode value={`https://adversarialapps.com/company/` + cik} className="rounded-lg" />
                  </div>
                </div>
              </div>
            )}
        </>
    );
};
