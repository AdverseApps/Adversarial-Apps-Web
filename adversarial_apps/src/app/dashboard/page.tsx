import LogoutButton from "@/components/logoutButton";
import { UserFavoriteCompanies } from "@/components/UserFavoriteCompanies";
import { verifyUser } from "../lib/data";
import { FetchSecData, getFavorites, getRiskScore } from "../lib/data";
import Link from "next/link";

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
        return { cik, data: result };
      } catch (error) {
        console.error(`Error fetching SEC data for CIK ${cik}:`, error);
        return { cik, data: null };
      }
    })
  );

  return (
    <div>
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
        <h1 className="text-xl font-bold mb-4">Favorite Companies:</h1>
        {favoritesData.length > 0 ? (
          favoritesData.map((item, index) => {
            const company = item.data?.company;
            return company ? (
              <UserFavoriteCompanies key={index} cik={item.cik} company={company} username={userStatus.username}/>
            ) : null;
          })
        ) : (
          <p>No favorite companies.</p>
        )}
      </div>



      {/* Logout button */}
      {/* Only the logout button needs interactivity */}
      <LogoutButton />
    </div>
  );
}
