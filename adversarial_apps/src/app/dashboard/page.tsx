import LogoutButton from "@/components/logoutButton";
import { FavoriteCompaniesAccordion } from "@/components/FavoriteCompaniesAccordion";
import { verifyUser } from "../lib/data";
import { FetchSecData, getFavorites, getRiskScore } from "../lib/data";
import Link from "next/link";
import Image from "next/image";


export default async function DashboardPage() {
  let userStatus;
  try {
    userStatus = await verifyUser();
    if (!userStatus || typeof userStatus !== "object") {
      throw new Error("Invalid response from VerifyReviewer.");
    }
  } catch (err) {
    console.error("Error in verifying user:", err);
    return (
      <div>
        <h1> Invalid or expired token. Please log in again.</h1>
      </div>
    );
  }

  if (!userStatus) {
    return (
      <div>
        <h1>Authentication required</h1>
      </div>
    );
  }

  // Getting CIK of Favorites
  const { favorites } = await getFavorites(userStatus.username);

  // Getting company data
  const favoritesData = await Promise.all(
    favorites.map(async (cik: string) => {
      try {
        const result = await FetchSecData(cik);

        // Fetching risk score
        const riskScoreData = await getRiskScore(cik);

        // Check if the status is 'success' or 'error'
        const riskScore = riskScoreData.status === 'success' ? riskScoreData.riskScore : -1; // Return -1 if the company is not verified
        return { cik, data: result, riskScore };
      } catch (error) {
        console.error(`Error fetching SEC data or risk score for CIK ${cik}:`, error);
        return { cik, data: null, riskScore: -1 }; // In case of any error, return -1 for riskScore
      }
    })
  );

  return (
    <div className="p-8">
      {/* Display username */}
      <p className="text-2xl font-bold">Welcome, {userStatus.username}!</p>
      <br />

      {userStatus && userStatus.role === "true" && (
        <div>
          <h2>Reviewer Features</h2>
          <button>Special Reviewer Action</button>
        </div>
      )}
      
      {/* Display Favorite Companies with SEC Data */}
      <div className="bg-gray-700 rounded-xl p-4 shadow-md">
        {/* Headers */}
        <div
          className="w-full text-lg pb-4 flex justify-between items-center place-items-center text-white font-semibold grid grid-cols-6 gap-2"
        >
          <div></div>
          <span>Company</span>
          <span>Verified</span>
          <span>Rating</span>
          <span>Remove Favorite</span>
          <span>QR Code</span>  
        </div>

        {/* Looping through each company */}
        {favoritesData.length > 0 ? (
          favoritesData.map((item, index) => {
            const company = item.data?.company;
            const riskScore = item.riskScore;
            return company ? (
              <FavoriteCompaniesAccordion key={index} cik={item.cik} company={company} username={userStatus.username} riskScore={riskScore} />
            ) : null;
          })
        ) : (
          <p>No favorite companies.</p>
        )}
      </div>

      {/* Logout button */}
      <div className="flex items-center justify-center pt-2">
        <LogoutButton />
      </div>
    </div>
  );
}
