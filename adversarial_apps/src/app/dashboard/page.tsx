import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import LogoutButton from "@/components/logoutButton";

interface DecodedToken extends JwtPayload {
  username: string;
  role: string;
}

export default async function DashboardPage()
{
  // 1. Read the cookie directly from the request
  const cookieToken = cookies().get("auth_token")?.value;

  if (!cookieToken)
  {
    return (
      <div>
        <h1>Authentication required</h1>
      </div>
    );
  }
  
  // 2. Verify and decode the JWT
  let username: string | null = null;
  let role: string | null = null;
  try
  {
    const decoded = jwt.verify(
      cookieToken,
      process.env.JWT_SECRET!
    ) as DecodedToken;
    console.log("Decoded = ",decoded);
    if (decoded && typeof decoded === "object" && "username" in decoded && "role" in decoded)
    {
      username = decoded.username as string;
      role = decoded.role as string;
    } else
    {
      throw new Error("Invalid token structure");
    }
  } catch (err)
  {
    console.error("JWT verification failed:", err);
    return (
      <div>
        <h1> Invalid or expired token. Please log in again.</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Only accessible if you are logged in with a valid JWT.</p>

      {/* Display username */}
      <p>Welcome, {username}!</p>

      {role === "true" && (
        <div>
          <h2>Reviewer Features</h2>
          <button>Special Reviewer Action</button>
        </div>
      )}

      {/* Logout button */}
      {/* Only the logout button needs interactivity */}
      <LogoutButton />
    </div>
  );
}
