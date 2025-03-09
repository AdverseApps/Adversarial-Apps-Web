import Link from "next/link";
export default function page(){
    return (
        <main aria-label="main-content">
            <h1 className="text-6xl font-bold pl-5">Forms and Resources</h1>

            <p className = "pl-5"><br />Resource pages are subject to the addition or removal of content 
                depending on relevance and effects of current legislation.</p>

            <p className = "pl-5"><br />Register with SAM:
                <a href="https://sam.gov/content/entity-registration" target="_blank"> <u>Click here for link</u></a></p>
            <p className = "pl-5"><br />Small Business Administration DSBS Company Lookup:
                <a href="https://dsbs.sba.gov/search/dsp_dsbs.cfm" target="_blank"> <u>Click here for link</u></a></p>

            {/* copy paste the below buttons for each subpage; make sure to relink */}
            <div className="container py-10 px-10 mx-0 min-w-full flex justify-center items-center space-x-4">
                <Link href = "/education/sam-compliance/page" passHref legacyBehavior>
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
                
                <Link href = "/education/sbir-due-diligence/page" passHref legacyBehavior>
                    <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
                        aria-label="Next Page">
                        Next Page
                    </button>
                </Link>
            </div>
        </main>
    );
}