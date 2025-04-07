"use client";

interface Props {
  certifications: string[];
}

export const CertsTable = ({ certifications }: Props) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-white mb-4">Certifications</h2>
      <p className="mb-4">
        Below are the small business and eligibility certifications associated
        with this company according to SAM.gov data. These designations help
        determine qualification for set-aside contracts and specialized federal
        procurement programs.
      </p>

      {certifications.length > 0 ? (
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
              {certifications.map((desc, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm">
                    {desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-white">No certifications found for this entity.</p>
      )}
    </div>
  );
};
