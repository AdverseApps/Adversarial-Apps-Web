'use client';

import { useState, useEffect } from "react";

export default function DownloadExcelButton({ username }: { username: string }) {
    const handleDownload = async () => {
        if (!username) {
            console.error("Username is required to download the file.");
            return;
        }

        try {
            console.log(`Downloading Excel file for ${username}...`);

            const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
            const domain = window.location.host;

            const data = { action: "generate_excel", username };

            const response = await fetch(`${protocol}://${domain}/api/call-python-api`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.status === 200) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = `${username}_company_data.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                console.log("File downloaded successfully.");
            } else {
                console.error("Failed to download file.");
            }
        } catch (error) {
            console.error("Error downloading Excel file:", error);
        }
    };

    return (
        <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors flex items-center space-x-2 mt-2"
            disabled={!username}
        >
            {username ? "Download Excel" : "Loading..."}
        </button>
    );
}
