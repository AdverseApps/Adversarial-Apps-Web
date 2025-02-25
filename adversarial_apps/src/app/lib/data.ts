import { headers } from 'next/headers';

// ================================
// ###### Server-Side Calls #######
// ================================

export async function FetchSecData(cik:string)  {
    try {

        console.log('Fetching SEC data...');

        const headersList = headers();
        const domain = headersList.get('host');
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

        const data = { action: "get_sec_data", search_term: cik };
        const response = await fetch(`${protocol}://${domain}/api/call-python-api`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        });

        if (!response.ok) {
            return { status: "error", message: `Failed to fetch data: ${response.statusText}` };
        }

        const result = await response.json();
        console.log(result);
      if(result.status === "success"){
        return (result); //type assertion
      }
      return { status: "error", message: `Failed to fetch data: ${response.statusText}` };
}catch (error) {
console.error('Failed to fetch SEC data:', error);
return { status: "error", message: "An unexpected error occurred." };
}
}



export async function FetchCIKnumber(query:string) {

    try {
        console.log('Fetching CIK number...');

        const headersList = headers();
        const domain = headersList.get('host');
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

        const data = { action: "obtain_cik_number", search_term: query };
        const response = await fetch(`${protocol}://${domain}/api/call-python-api`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        });

        if (response.status === 200) {
            const result = await response.json();
            console.log(result);
    
            const companies = result.companies.map((company: { "Company Name": string, "CIK": string }) => ({
                name: company["Company Name"],
                cik: company["CIK"]
            }));
            
            return(companies);
        }
        return (null);

    }catch (error) {
        console.error('Failed to fetch CIK number:', error);
    }
}

// Checks authentication and returns username or null
export async function getUsername() {
    try { 
      console.log("Getting Username:")
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
      console.log("Getting Favorites:")
        const headersList = headers();
        const domain = headersList.get("host");
        const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

        const response = await fetch(`${protocol}://${domain}/api/call-python-api`, {
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
        });

        if (!response.ok) {
        console.error(`Favorites fetch failed: ${response.statusText}`);
        return { favorites: [], error: response.statusText };
        }

        const data = await response.json();
        console.log("Favorites Data:", data);

        return { favorites: data.favorites || [] };
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return { favorites: [], error: "Unexpected error occurred." };
    }
}
  

export async function getRiskScore(cik:string) {
  try {
    console.log("Getting Risk Score:")
    const headersList = headers();
    const domain = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    
    const data = { action: "get_company_score", cik };
    const response = await fetch(`${protocol}://${domain}/api/call-python-api`, {
      method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        });
  
        if (!response.ok) {
          console.error(`risk score fetch failed: ${response.statusText}`);
          
          return { status: "error", message: `Failed to fetch risk score: ${response.statusText}` };
        }
        const result = await response.json();
        console.log(result);
      return (result);
  }
  catch(error){
    console.error("Error fetching Risk Score:", error);
    return { status: "error", message:  `An unexpected error occurred: ${error}`};
  }
}