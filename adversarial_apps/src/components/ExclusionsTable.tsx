"use client";

import Image from "next/image";

type ExclusionsTableProps = {
  company_name?: string | null;
  exclusion_type?: string | null;
  excluding_agency?: string | null;
  ex_active_date?: string | null;
  ex_termination_date?: string | null;
};

export default function ExclusionsTable({
  company_name,
  exclusion_type,
  excluding_agency,
  ex_active_date,
  ex_termination_date,
}: ExclusionsTableProps) {
  const hasExclusion =
    company_name ||
    exclusion_type ||
    excluding_agency ||
    ex_active_date ||
    ex_termination_date;
  return (
    <div className="mt-8">
      <div className="w-full mt-6 bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-white">
        <div className="flex justify-center items-center">
          <Image src="/warning.png" width={40} height={15} alt="Warning" />
          <h2 className="text-3xl font-bold mb-2 ml-2">Exclusions</h2>
          <Image src="/warning.png" width={40} height={15} alt="Warning" />
        </div>
        <p>
          {company_name} has active exclusions that may disqualify them from
          participating in certain federal contracts, subcontracts, grants,
          loans, and/or other federal assistance programs. It is recommended to
          ask any entity about potential exclusions before partnering. Please
          refer to{" "}
          <a
            href="https://sam.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 underline hover:text-blue-400 transition-colors"
          >
            SAM.gov
          </a>{" "}
          for more information.
        </p>
        {hasExclusion ? (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Exclusion Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Excluding Agency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Active Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Termination Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                <tr className="bg-gray-900 text-gray-100">
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm">
                    {exclusion_type || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm">
                    {excluding_agency || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm">
                    {ex_active_date || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm">
                    {ex_termination_date || "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            This entity has no reported exclusions in SAM.gov.
          </p>
        )}
      </div>
    </div>
  );
}
{
  /*
      {exclusions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Exclusion Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {exclusions.map((desc, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-white">No exclusions found for this entity.</p>
      )}
    </div>
  );
};

*/
}
