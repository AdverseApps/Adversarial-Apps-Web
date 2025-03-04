import LogoutButton from "@/components/logoutButton";
import { UserFavoriteCompanies } from "@/components/UserFavoriteCompanies";
import { verifyUser } from "../lib/data";
import { FetchSecData, getFavorites } from "../lib/data";
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

      {/* Display Favorite Companies */}
      <UserFavoriteCompanies username={userStatus.username} />
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
            const formattedAddress = company
              ? `${company.address || "N/A"}${company.street2 ? `, ${company.street2}` : ""}, ${company.city || "N/A"}, ${company.stateOrCountryDescription || "N/A"} ${company.zipCode || "N/A"}`
              : "N/A";

            return (
              <div key={index} className="mb-4 p-4 border border-gray-500 rounded-lg">
                <p className="underline text-lg font-semibold">
                  <Link href={`/company/${item.cik}`}>CIK: {item.cik}</Link>
                </p>

                {company ? (
                  <div>
                    <p><strong>Name:</strong> {company.name || "N/A"}</p>
                    <p><strong>Address:</strong> {formattedAddress}</p>
                    <p><strong>State of Incorporation:</strong> {company.stateOfIncorporation || "N/A"}</p>
                    <p><strong>Phone:</strong> {company.phone || "N/A"}</p>
                    <p><strong>Most Recent Filing Date:</strong> {company.mostRecentFilingDate || "N/A"}</p>
                  </div>
                ) : (
                  <p>No company data available</p>
                )}
              </div>
            );
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
