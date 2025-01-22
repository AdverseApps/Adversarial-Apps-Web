import { headers } from 'next/headers';

export async function FetchSecData(cik:string): Promise<{ status: string; company?: any; message?: string }> {
    
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
      
        return (result);
      
      
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