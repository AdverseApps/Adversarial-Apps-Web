
import {FetchSecData} from '@/app/lib/data';

interface CompanyDetailsProps {
    params: { cik: string };
  }
  

  interface FormerName {
    name: string;
    fromDate: string;
    toDate: string;
  }

export default async function page ({ params }: CompanyDetailsProps){
    const { cik } = params;

    
      

    let result;
    try {
      result = await FetchSecData(cik);
  
      if (!result || typeof result !== "object") {
        throw new Error("Invalid response from FetchSecData.");
      }
    } catch (error) {
      console.error("Error in FetchSecData:", error);
      return (
        <div className="flex justify-center mt-6">
          <div className="text-center text-xl text-red-500">
            <h2>Error</h2>
            <p>Unable to fetch company details at this time. Please try again later.</p>
          </div>
        </div>
      );
    }
 // If fetching failed, handle the error
 if (result.status !== "success") {
  return (
    <div className="flex justify-center mt-6">
      <div className="text-center text-xl text-red-500">
        <h2>Error</h2>
        <p>{result.message || "An unknown error occurred while fetching company details."}</p>
      </div>
    </div>
  );
}
const { name, 
        formerNames, 
        address, 
        stateOrCountryDescription, 
        stateOfIncorporation, 
        dateOfCreation, 
        phone, 
        website 
} = result.company;

const formatDate = (date: string): string => {
  const parsedDate = new Date(date);
  return parsedDate.toLocaleDateString("en-US"); // Format: MM/DD/YYYY
};

  return(
    
  <div className="flex mt-6">
    <div className="w-full max-w-xl text-left text-xl p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Company Details</h2>
       <p>
        <span className="font-semibold">Name:</span> {name || "N/A"}
      </p>

        {formerNames && formerNames.length > 0 && (
          <div className="mt-4">
          <h3 className="text-lg font-semibold">Former Names:</h3>
          <ul className="list-disc pl-5">
            {formerNames.map((item: FormerName, index: number) => (
              <li key={index}>
                <span className="font-medium">{item.name}</span> (From: {formatDate((item.fromDate))} To: {formatDate(item.toDate)})
              </li>
              ))}
          </ul>
        </div>
      )}

      <p>
        <span className="font-semibold">Business Address:</span> {address || "N/A"}
      </p>
      <p>
        <span className="font-semibold">State or Country:</span> {stateOrCountryDescription || "N/A"}
      </p>
      <p>
        <span className="font-semibold">State of Incorporation:</span> {stateOfIncorporation || "N/A"}
      </p>
      <p>
        <span className="font-semibold">Date of Creation:</span> {dateOfCreation || "N/A"}
      </p>
      <p>
        <span className="font-semibold">Phone:</span> {phone || "N/A"}
      </p>
      <p>
        <span className="font-semibold">Website:</span>{" "}
        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {website}
          </a>
        ) : (
          "N/A"
        )}
        </p>
      </div>
    </div>
  );
}