import { FetchSecData, getRiskScore } from "../lib/data";
import { ExampleCompaniesAccordion } from "@/components/ExampleCompaniesAccordion";

interface Company {
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

interface ExampleCompanyProps {
  cik: string;
  company: Company;
  riskScore: number | null;
}

// These are the provided hardcoded CIKs
const okayCiks = [
  "0000936468",
  "0000901999",
  "0001911595",
  "0001897971",
  "0000356628"
];

const noWayCiks = ["0001392363"];

export default async function ExampleTablesPage() {
  // Helper to fetch SEC + risk score info for a given CIK
  const getCompanyInfo = async (cik: string): Promise<ExampleCompanyProps | null> => {
    try {
      const result = await FetchSecData(cik);
      const riskScoreData = await getRiskScore(cik);
      const riskScore = riskScoreData.status === "success" ? riskScoreData.riskScore : -1;
      return {
        cik,
        company: result?.company || {},
        riskScore
      };
    } catch (error) {
      console.error(`Failed to load data for CIK ${cik}:`, error);
      return null;
    }
  };

  const okayData = await Promise.all(okayCiks.map(getCompanyInfo));
  const noWayData = await Promise.all(noWayCiks.map(getCompanyInfo));

  return (
    <div className="p-8 space-y-8">
      {/* Okay Table */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Okay Companies:</h2>
        <div className="bg-gray-700 rounded-xl p-4 shadow-md">
          <div className="w-full text-lg pb-4 flex justify-between items-center place-items-center text-white font-semibold grid grid-cols-6 gap-2">
            <div></div>
            <span>Company</span>
            <span>Verified</span>
            <span>Rating</span>
            <span>QR Code</span>
          </div>
          {okayData.filter(Boolean).length > 0 ? (
            okayData.map((item, index) =>
              item ? (
                <ExampleCompaniesAccordion
                  key={index}
                  cik={item.cik}
                  company={item.company}
                  riskScore={item.riskScore}
                />
              ) : null
            )
          ) : (
            <p className="text-white">No companies to show.</p>
          )}
        </div>
      </div>

      {/* No-Way Table */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">No-Way Companies:</h2>
        <div className="bg-gray-700 rounded-xl p-4 shadow-md">
          <div className="w-full text-lg pb-4 flex justify-between items-center place-items-center text-white font-semibold grid grid-cols-6 gap-2">
            <div></div>
            <span>Company</span>
            <span>Verified</span>
            <span>Rating</span>
            <span>Remove Favorite</span>
            <span>QR Code</span>
          </div>
          {noWayData.filter(Boolean).length > 0 ? (
            noWayData.map((item, index) =>
              item ? (
                <ExampleCompaniesAccordion
                  key={index}
                  cik={item.cik}
                  company={item.company}
                  riskScore={item.riskScore}
                />
              ) : null
            )
          ) : (
            <p className="text-white">No companies to show.</p>
          )}
        </div>
      </div>
    </div>
  );
}
