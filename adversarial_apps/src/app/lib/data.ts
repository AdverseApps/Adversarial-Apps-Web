import { headers } from "next/headers";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

// ================================
// ###### Server-Side Calls #######
// ================================
// Define your decoded token interface.

interface DecodedToken extends JwtPayload {
  username: string;
  role: string;
}

interface ReviewRequestAPIResponse {
  identifier: string;
  requestCount: number;
  source: string;
}

export async function FetchSecData(cik: string) {
  try {
    console.log("Fetching SEC data...");

    const headersList = headers();
    const domain = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const data = { action: "get_sec_data", search_term: cik };
    const response = await fetch(
      `${protocol}://${domain}/api/call-python-api`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      return {
        status: "error",
        message: `Failed to fetch data: ${response.statusText}`,
      };
    }

    const result = await response.json();
    console.log(result);
    if (result.status === "success") {
      return result; //type assertion
    }
    return {
      status: "error",
      message: `Failed to fetch data: ${response.statusText}`,
    };
  } catch (error) {
    console.error("Failed to fetch SEC data:", error);
    return { status: "error", message: "An unexpected error occurred." };
  }
}

export async function FetchSamData(uei: string) {
  try {
    console.log("Fetching SAM data...");

    const headersList = headers();
    const domain = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const data = { action: "fetch_sam_data", uei };
    const response = await fetch(
      `${protocol}://${domain}/api/call-python-api`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      return {
        status: "error",
        message: `Failed to fetch SAM data: ${response.statusText}`,
      };
    }

    const result = await response.json();
    console.log(result);
    if (result.status === "success") {
      return result; // Expected to contain { company: { ... } }
    }
    return {
      status: "error",
      message: `Failed to fetch SAM data: ${response.statusText}`,
    };
  } catch (error) {
    console.error("Failed to fetch SAM data:", error);
    return { status: "error", message: "An unexpected error occurred." };
  }
}

export async function FetchCIKnumber(query: string) {
  try {
    console.log("Fetching CIK number...");

    const headersList = headers();
    const domain = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const data = { action: "obtain_cik_number", search_term: query };
    const response = await fetch(
      `${protocol}://${domain}/api/call-python-api`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (response.status === 200) {
      const result = await response.json();
      console.log(result);

      const companies = result.companies.map(
        (company: { "Company Name": string; CIK: string }) => ({
          name: company["Company Name"],
          cik: company["CIK"],
        })
      );

      return companies;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch CIK number:", error);
  }
}

// Checks authentication and returns username or null
export async function getUsername() {
  try {
    console.log("Getting Username:");
    const headersList = headers();
    const domain = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const response = await fetch(`${protocol}://${domain}/api/verify-login`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: headersList.get("cookie") || "",
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`Authentication fetch failed: ${response.statusText}`);
      return { username: null };
    }

    const { user } = await response.json();

    if (!user) {
      return { username: null };
    }

    return { username: user };
  } catch (error) {
    console.error("Failed to authenticate", error);
    return { username: null };
  }
}

export async function getFavorites(username: string) {
  try {
    console.log("Getting Favorites:");
    const headersList = headers();
    const domain = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const response = await fetch(
      `${protocol}://${domain}/api/call-python-api`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: headersList.get("cookie") || "",
        },
        body: JSON.stringify({
          action: "get_favorites",
          username: username,
        }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      console.error(`Favorites fetch failed: ${response.statusText}`);
      return { secFavorites: [], samFavorites: [], error: response.statusText };
    }

    const data = await response.json();
    console.log("Favorites Data:", data);

    // Combine SEC and SAM favorites into one array with source indicators
    const combinedFavorites = [
      ...(data.sec_favorites || []).map((fav: string) => ({
        id: fav,
        source: "SEC" as const,
      })),
      ...(data.sam_favorites || []).map((fav: string) => ({
        id: fav,
        source: "SAM" as const,
      })),
    ];

    return { favorites: combinedFavorites };
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return { favorites: [], error: "Unexpected error occurred." };
  }
}

export async function getRiskScore(identifier: string, source: string) {
  try {
    console.log("Getting Risk Score:");
    const headersList = headers();
    const domain = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const data = { action: "get_company_score", identifier, source };
    const response = await fetch(
      `${protocol}://${domain}/api/call-python-api`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      console.error(`risk score fetch failed: ${response.statusText}`);

      return {
        status: "error",
        message: `Failed to fetch risk score: ${response.statusText}`,
      };
    }
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error fetching Risk Score:", error);
    return {
      status: "error",
      message: `An unexpected error occurred: ${error}`,
    };
  }
}

// Function to verify login status and reviewer status by reading and decoding the auth token.
export async function verifyUser(): Promise<{
  username: string;
  role: string;
} | null> {
  // 1. Read the cookie directly from the request.
  const cookieToken = cookies().get("auth_token")?.value;
  if (!cookieToken) {
    console.error("No auth_token cookie found.");
    return null;
  }

  // 2. Verify and decode the JWT.
  try {
    const decoded = jwt.verify(
      cookieToken,
      process.env.JWT_SECRET!
    ) as DecodedToken;
    if (
      decoded &&
      typeof decoded === "object" &&
      "username" in decoded &&
      "role" in decoded
    ) {
      // Log successful decoding for debugging.
      console.log("JWT successfully verified:", {
        username: decoded.username,
        role: decoded.role,
      });
      // Return the decoded details.
      return { username: decoded.username, role: decoded.role };
    } else {
      throw new Error("Invalid token structure");
    }
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

export async function getTotalCommonStocks(cik: string) {
  try {
    console.log("Getting Total Common Stocks:");
    const headersList = headers();
    const domain = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const data = { action: "get_total_common_stocks", cik };
    const response = await fetch(
      `${protocol}://${domain}/api/call-python-api`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      console.error(`Total Common Stocks fetch failed: ${response.statusText}`);
      return {
        status: "error",
        message: `Failed to fetch total common stocks: ${response.statusText}`,
      };
    }
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error fetching Total Common Stocks:", error);
    return {
      status: "error",
      message: `An unexpected error occurred: ${error}`,
    };
  }
}

export async function getDefUrl(cik: string) {
  try {
    console.log("Getting DEF 14A URL:");
    const headersList = headers();
    const domain = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const data = { action: "get_def_url", cik };
    const response = await fetch(
      `${protocol}://${domain}/api/call-python-api`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      console.error(`DEF 14A URL fetch failed: ${response.statusText}`);
      return {
        status: "error",
        message: `Failed to fetch DEF 14A URL: ${response.statusText}`,
      };
    }
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error fetching DEF 14A URL:", error);
    return {
      status: "error",
      message: `An unexpected error occurred: ${error}`,
    };
  }
}

export async function getReviewRequests(): Promise<{
  status: string;
  reviewRequests?: {
    identifier: string;
    requestCount: number;
    source: string;
  }[];
  message?: string;
}> {
  try {
    console.log("Getting Review Requests:");
    const headersList = headers();
    const domain = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const data = { action: "get_review_requests" };
    const response = await fetch(
      `${protocol}://${domain}/api/call-python-api`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      console.error(`Review Requests fetch failed: ${response.statusText}`);
      return {
        status: "error",
        message: `Failed to fetch Review Requests: ${response.statusText}`,
      };
    }
    const result = await response.json();
    console.log(result);

    // Ensure all entries have identifier + source
    if (result.status === "success" && Array.isArray(result.reviewRequests)) {
      result.reviewRequests = result.reviewRequests.map(
        (entry: ReviewRequestAPIResponse) => ({
          identifier: entry.identifier,
          requestCount: entry.requestCount,
          source: entry.source,
        })
      );
    }

    return result;
  } catch (error) {
    console.error("Error fetching review requests:", error);
    return { status: "error", message: "Error fetching review requests" };
  }
}
