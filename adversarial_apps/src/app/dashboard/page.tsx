import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import LogoutButton from "@/components/logoutButton";

export default async function DashboardPage() {
  // 1. Read the cookie directly from the request
  const cookieToken = cookies().get("auth_token")?.value;
  if (!cookieToken) {
    return (
      <div>
        <h1>Authentication required</h1>
      </div>
    );
  }

  // 2. Verify and decode the JWT
  let username: string | null = null;
  let isReviewer: boolean | null = false;
  try {
    const decoded = jwt.verify(
      cookieToken,
      process.env.JWT_SECRET!
    ) as JwtPayload;
    if (decoded && typeof decoded === "object" && "username" in decoded && "isReviewer" in decoded) {
      username = decoded.username as string;
      isReviewer = decoded.isReviewer as boolean;
    } else {
      throw new Error("Invalid token structure");
    }
  } catch (err) {
    console.error("JWT verification failed:", err);
    return (
      <div>
        <h1>Invalid or expired token. Please log in again.</h1>
      </div>
    );
  }

  // 3a. Check if the user is a reviewer; if so, execute this return
  if(isReviewer)
  {
    return (
      <div>
        <h1>Protected Page</h1>
        <p>Only accessible if you are logged in with a valid JWT.</p>
  
        {/* Display username */}
        <p>Welcome, {username}! You are a reviewer!</p>
  
        {/* Logout button */}
        {/* Only the logout button needs interactivity */}
        <LogoutButton />
      </div>
    );
  }

  // 3b. ...If not, go to default
  return (
    <div>
      <h1>Protected Page</h1>
      <p>Only accessible if you are logged in with a valid JWT.</p>

      {/* Display username */}
      <p>Welcome, {username}!</p>

      {/* Logout button */}
      {/* Only the logout button needs interactivity */}
      <LogoutButton />
    </div>
  );
}
