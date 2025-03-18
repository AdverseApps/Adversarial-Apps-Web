//this is a UI file for loading page skeletons
//when making a new skeleton please name the function "Skeleton*folder*"
//and add comments detailing which loading box corresponds to which field on the page
export function SkeletonCompany() {
    return (
        <div className="flex flex-col p-8 gap-4 bg-gray-900 text-white min-h-screen">
          {/* Company info and risk score boxes */}
          <div className="flex gap-4 mt-4">
            <div className="bg-gray-700 w-1/2 h-48 animate-pulse rounded"></div>
            <div className="bg-gray-700 w-1/2 h-48 animate-pulse rounded"></div>
          </div>
          {/* Recent owners box */}
          <div className="bg-gray-700 w-full h-24 animate-pulse rounded mt-4"></div>
          {/* SEC/EDGAR disclaimer box */}
          <div className="flex justify-center space-x-4">
          <div className="bg-gray-700 w-1/2 h-4 animate-pulse rounded"></div>
          </div>
        </div>

        
      );
    }


    export function SkeletonDashboard() {
        return (
          <div className="min-h-screen bg-gray-900 text-white p-6 space-y-6">
            {/* Welcome Header */}
            <div className="bg-gray-700 w-1/2 h-6 rounded animate-pulse"></div>
      
            {/* Table Container */}
            <div className="bg-gray-800 p-4 rounded space-y-4">
              {/* Table Header */}
              <div className="flex items-center space-x-2 py-2 text-gray-300">
                <div className="bg-gray-700 w-6 h-6 rounded animate-pulse"></div>
                <div className="bg-gray-700 w-32 h-6 rounded animate-pulse"></div>
                <div className="bg-gray-700 w-16 h-6 rounded animate-pulse"></div>
                <div className="bg-gray-700 w-12 h-6 rounded animate-pulse"></div>
                <div className="bg-gray-700 w-20 h-6 rounded animate-pulse"></div>
                <div className="bg-gray-700 w-12 h-6 rounded animate-pulse"></div>
              </div>
      
              {/* Simulated Rows */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-2 py-2 bg-gray-700 rounded animate-pulse mb-2"
                >
                  <div className="bg-gray-600 w-6 h-6 rounded"></div>
                  <div className="bg-gray-600 w-32 h-6 rounded"></div>
                  <div className="bg-gray-600 w-16 h-6 rounded"></div>
                  <div className="bg-gray-600 w-12 h-6 rounded"></div>
                  <div className="bg-gray-600 w-20 h-6 rounded"></div>
                  <div className="bg-gray-600 w-12 h-6 rounded"></div>
                </div>
              ))}
            </div>
      
            {/* Bottom Buttons */}
            <div className="flex justify-center space-x-4">
              <div className="bg-gray-700 w-20 h-8 rounded animate-pulse"></div>
              <div className="bg-gray-700 w-32 h-8 rounded animate-pulse"></div>
            </div>
          </div>
        );
      }