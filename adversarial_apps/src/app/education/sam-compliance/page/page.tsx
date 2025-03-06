import Link from "next/link";
export default function page(){
    return (
        <main aria-label="main-content">
            <h1 className="text-6xl font-bold pl-5">SAM Info and Compliance</h1>
            <h2 className="text-xl font-bold pl-5"><br />What is SAM?</h2>
            <p className = "pl-5">SAM is the website used by most, if not all, prime contractors and other 
                parties working for the United States government. Among other administrative tasks for your 
                entity (which is defined at length as several kinds of parties doing business with the U.S. 
                government), it is one of the primary avenues used to obtain contracts and federal aid.</p>

            <p className = "pl-5"><br />Registering your entity for a SAM profile and obtaining a Unique Entity 
                is required to directly apply for awards posted on SAM. Applying for financial assistance rewards 
                has fewer requirements when registering for SAM than to register to be eligible for all awards.</p>

            <p className = "pl-5"><br />Registering within SAM will also automatically produce an entry for you 
                in the Small Business Administration&apos;s database. The SBA maintains a searchable database 
                for the public, the Dynamic Small Business Search (DSBS), which contains records of all entities 
                that have had contracts, both completed and ongoing, with the U.S. government.</p>
            
            <h2 className="text-xl font-bold pl-5"><br />How do I maintain SAM compliance?</h2>
            <p className = "pl-5">Simply renew your business registration annually, using your past registration
                information. Any updates to business policies that are relevant to SAM should be updated
                in SAM immediately.</p>

            {/* copy paste the below buttons for each subpage; make sure to relink */}
            <div className="container py-10 px-10 mx-0 min-w-full flex justify-center items-center space-x-4">
                <Link href = "/education/cfr-title-15/resources" passHref legacyBehavior>
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

                <Link href = "/education/sam-compliance/resources" passHref legacyBehavior>
                    <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
                        aria-label="Next Page">
                        Next Page
                    </button>
                </Link>
            </div>
        </main>
    );
}