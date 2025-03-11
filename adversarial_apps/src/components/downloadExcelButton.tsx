'use client';

import Image from "next/image";

export default function DownloadExcelButton({ username }: { username: string }) {
    const handleDownload = async () => {
        if (!username) {
            console.error("Username is required to download the file.");
            return;
        }

        try {
            console.log(`Requesting Excel file generation for ${username}...`);

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
                const result = await response.json(); // Parse JSON response

                if (result.status === "success" && result.file) {
                    // Decode the Base64 string into binary data
                    const byteCharacters = atob(result.file);  // Decode Base64 string
                    const byteArray = new Uint8Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteArray[i] = byteCharacters.charCodeAt(i);
                    }

                    // Create a Blob from the binary data
                    const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                    const url = window.URL.createObjectURL(blob);

                    // Create a hidden anchor tag to trigger the download
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = result.filename || "download.xlsx";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    console.log("File downloaded successfully.");
                } else {
                    console.error("Error: Invalid response from server.");
                }
            } else {
                console.error("Failed to request file generation.");
            }
        } catch (error) {
            console.error("Error downloading Excel file:", error);
        }
    };

    return (
        <button
            onClick={handleDownload}
            className="px-2 py-2 bg-green-700 text-white rounded-md shadow-md hover:bg-green-800 transition-colors flex items-center space-x-2 mt-2"
            disabled={!username}
        >
            {username ? "Export to Excel" : "Loading..."}
        </button>
    );
}
