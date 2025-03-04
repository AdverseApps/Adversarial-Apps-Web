import Link from "next/link";
export default function page(){
    return (
        <main aria-label="main-content">
            <h1 className="text-6xl font-bold pl-5">Forms and Resources</h1>
            
            <p className = "pl-5"><br />CFR Title 15 Full Documentation:
                <a href="https://www.ecfr.gov/current/title-15/" target="_blank"> <u>Click here for link</u></a></p>
            <p className = "pl-5"><br />CFR Title 15, Part 791 Documentation:
                <a href="https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-E/part-791" target="_blank"> <u>Click here for link</u></a></p>
            <p className = "pl-5"><br />Federal Acquisition Regulation (FAR) Documentation:
                <a href="https://www.acquisition.gov/browse/index/far" target="_blank"> <u>Click here for link</u></a></p>

            {/* copy paste the below buttons for each subpage; make sure to relink */}
            <div className="container py-10 px-10 mx-0 min-w-full flex justify-center items-center space-x-4">
                <Link href = "/education/cfr-title-15/page" passHref legacyBehavior>
                    <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
                        aria-label="Previous Page">
                        Previous Page
                    </button>
                </Link>

                <Link href = "/education" passHref legacyBehavior>
                    <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
                        aria-label="Back to Education Hub">
                        Back to Education Hub
                    </button>
                </Link>

                <Link href = "/education/sam-compliance/page" passHref legacyBehavior>
                    <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
                        aria-label="Next Page">
                        Next Page
                    </button>
                </Link>

            </div>
        </main>
    );
}