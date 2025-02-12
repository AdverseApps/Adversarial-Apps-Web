import Link from "next/link";
export default function page(){
    return (
        <main aria-label="main-content">
            <h1 className="text-6xl font-bold pl-5">Foreign Ownership Control and Influence (FOCI)</h1>
            <h2 className="text-xl font-bold pl-5"><br />What is FOCI? Why should I care?</h2>
            <p className = "pl-5"><br />FOCI is an important part of ensuring compliance with CFR Title 15. In 
                FOCI, ownership generally refers to beneficial ownership of the business. A beneficial 
                owner of a security &mdash; in this case a business &mdash; includes any person who 
                directly or indirectly through any contract arrangement, understanding, relationship, or 
                otherwise has or shares any of the following:</p>
            <ol className = "pl-10"><br />
                <li>    1. Voting power, which includes the power to vote or to direct the voting of such security; or</li>
                <li>    2. Investment power, which includes the power to dispose of or to direct the disposition of such security.</li>
            </ol>
            <p className = "pl-5"><br />In this case, security just means ownership of a portion of the business. 
                Voting power involves any decisions an owner might make about business operations, regardless 
                of whether that power is being actively exercised.</p>
            <p className = "pl-5"><br />For more information, please visit this page:
                <a target="_blank" href="https://business.defense.gov/Resources/FOCI/"> <u>FOCI Resources Page</u></a></p>
            
            {/* copy paste the below button(s) for each subpage */}
            <div className="container py-10 px-10 mx-0 min-w-full flex flex-col items-center">
                <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
                        aria-label="Back to Education Hub">
                    <Link href = "/education">Back to Education Hub</Link>
                </button>
            </div>
        </main>
    );
}