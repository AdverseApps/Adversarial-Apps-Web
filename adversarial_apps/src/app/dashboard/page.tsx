import LogoutButton from "@/components/logoutButton";
import { FavoriteCompaniesAccordion } from "@/components/FavoriteCompaniesAccordion";
import { FetchSamData, getReviewRequests, verifyUser } from "../lib/data";
import { FetchSecData, getFavorites, getRiskScore } from "../lib/data";
import DownloadExcelButton from "@/components/downloadExcelButton";
import { ReviewRequestsAccordion } from "@/components/ReviewRequestsAccordion";

interface SECCompany {
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

interface SAMCompany {
  legal_business_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_or_province?: string;
  zip_code?: string;
  country_code?: string;
  registration_date?: string;
  expiration_date?: string;
}

interface FavoriteCompanyProps {
  identifier: string;
  company: SECCompany | SAMCompany;
  source: "SEC" | "SAM";
  username: string;
  riskScore: number | null;
}

interface ReviewRequestProps {
  identifier: string;
  source: "SEC" | "SAM";
  company: SECCompany | SAMCompany;
  requestCount: number;
}

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

  let favoritesData: FavoriteCompanyProps[] = [];
  if (userStatus.role === "false") {
    // Getting CIK of Favorites
    const favoritesResponse = await getFavorites(userStatus.username);
    const favorites = Array.isArray(favoritesResponse.favorites)
      ? favoritesResponse.favorites
      : [];
    // Use Promise.all to wait for all promises to resolve
    favoritesData = await Promise.all(
      favorites.map(
        async (item: { identifier: string; source: "SEC" | "SAM" }) => {
          try {
            const company =
              item.source === "SEC"
                ? (await FetchSecData(item.identifier)).company
                : (await FetchSamData(item.identifier)).company;

            // Fetching risk score
            const riskScoreData = await getRiskScore(
              item.identifier,
              item.source
            );

            // Check if the status is 'success' or 'error'
            const riskScore =
              riskScoreData.status === "success" ? riskScoreData.riskScore : -1; // Return -1 if the company is not verified
            return {
              identifier: item.identifier,
              company,
              source: item.source,
              username: userStatus.username,
              riskScore,
            };
          } catch (error) {
            console.error(
              `Error fetching ${item.source} data or risk score for ${item.identifier}:`,
              error
            );
            return {
              identifier: item.identifier,
              company: null,
              source: item.source,
              username: userStatus.username,
              riskScore: -1,
            }; // In case of any error, return -1 for riskScore
          }
        }
      )
    );
  }

  /*
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
  */

  let reviewRequests: ReviewRequestProps[] = [];

  if (userStatus.role === "true") {
    try {
      const reviewData = await getReviewRequests();
      if (reviewData.status === "success" && reviewData.reviewRequests) {
        reviewRequests = await Promise.all(
          reviewData.reviewRequests.map(async (item) => {
            const source = item.source as "SEC" | "SAM";
            const companyData =
              source === "SEC"
                ? await FetchSecData(item.identifier)
                : await FetchSamData(item.identifier);

            return {
              identifier: item.identifier,
              source: item.source as "SEC" | "SAM",
              requestCount: item.requestCount,
              company: companyData.company,
            };
          })
        );
      }
    } catch (error) {
      console.error("Error fetching review requests:", error);
    }
  }

  return (
    <div className="p-8">
      {/* Display username */}
      <p className="text-2xl font-bold">Welcome, {userStatus.username}!</p>
      <br />

      {/* Display Favorite Companies with SEC Data */}
      {userStatus.role === "false" && (
        <div className="bg-gray-700 rounded-xl p-4 shadow-md">
          {/* Headers */}
          <div className="w-full text-lg pb-4 flex justify-between items-center place-items-center text-white font-semibold grid grid-cols-6 gap-2">
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
              const company = item?.company;
              return company ? (
                <FavoriteCompaniesAccordion
                  key={index}
                  identifier={item.identifier}
                  source={item.source}
                  company={item.company}
                  username={userStatus.username}
                  riskScore={item.riskScore}
                />
              ) : null;
            })
          ) : (
            <p>No favorite companies.</p>
          )}
        </div>
      )}
      {/* Review Requests Section (for reviewer users) */}
      {userStatus.role === "true" && (
        <div className="bg-gray-700 rounded-xl p-4 shadow-md">
          {/* Header Section */}
          <div className="w-full text-lg pb-4 flex justify-between items-center place-items-center text-white font-semibold grid grid-cols-6 gap-2">
            <div></div>
            <span>Company</span>
            <span>Requests</span>
            <span>Remove Request</span>
            <span>QR Code</span>
            <span>More Info</span>
          </div>

          {/* Loop through each review request */}
          {reviewRequests.length > 0 ? (
            reviewRequests.map((item, index) => (
              <ReviewRequestsAccordion
                key={index}
                identifier={item.identifier}
                source={item.source}
                company={item.company}
                requestCount={item.requestCount}
              />
            ))
          ) : (
            <p className="text-white">No review requests.</p>
          )}
        </div>
      )}
      {/* Logout button */}
      <div className="flex items-center justify-center pt-2 gap-x-4">
        <LogoutButton />
        <DownloadExcelButton username={userStatus.username} />
      </div>
    </div>
  );
}
