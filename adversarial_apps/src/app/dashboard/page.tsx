import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import LogoutButton from "@/components/logoutButton";
import { UserFavoriteCompanies } from '@/components/UserFavoriteCompanies';
import { verifyUser } from "../lib/data";


interface DecodedToken extends JwtPayload {
  username: string;
  role: string;
}

export default async function DashboardPage()
{
  let userStatus;
  try
  {
    userStatus = await verifyUser();
    if (!userStatus || typeof userStatus !== "object") {
      throw new Error("Invalid response from VerifyReviewer.");
    }    
  } catch (err)
  {
    console.error("Error in verifying user:", err);
    return (
      <div>
        <h1> Invalid or expired token. Please log in again.</h1>
      </div>
    );
  }

  if (!userStatus)
  {
    return (
      <div>
        <h1>Authentication required</h1>
      </div>
    );
  }
  
  


    return (
        <div>
            <h1>Protected Page</h1>
            <p>Only accessible if you are logged in with a valid JWT.</p>
            <br/>

            {/* Display username */}
            <p>Welcome, {userStatus.username}!</p>
            <br/>

            {/* Display Favorite Companies */}
            <UserFavoriteCompanies username={userStatus.username}/>
            <br/>

      {userStatus && userStatus.role === "true" && (
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
