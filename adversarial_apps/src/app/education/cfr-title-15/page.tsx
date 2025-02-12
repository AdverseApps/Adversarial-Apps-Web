import Link from "next/link";
export default function page(){
    return (
    <>
        <main aria-label="main-content">
            <h1 className="text-6xl font-bold pl-5">CFR Title 15</h1>
            <h2 className="text-xl font-bold pl-5"><br />What is Title 15 about?</h2>
            <p className = "pl-5"><br />A CFR stands for Code of Federal Regulations and contains 
                all the codes and regulations published by the government 
                from various departments.</p>

            <p className = "pl-5"><br />What this law does is that it extends SBIR and STTR awards 
                till 2025 instead of ending in 2022 which is what it was set to originally. 
                More importantly to our project, it also established the Due Diligence Program. 
                This program was established to assess the security risks associated with cybersecurity 
                practices, patents, foreign adversaries and ownership, employees, and more for small businesses seeking awards 
                through these programs for each federal head in charge of that process. It further requires that each small business 
                disclose certain information in regard to foreign adversaries such as the ownership percentage for foreign adversaries, 
                patent processing in foreign countries, and other such fields.</p>

            <h2 className="text-xl font-bold pl-5"><br />What is CFR Title 15, Part 791? 
                A Concise Breakdown of Its Documentation and Its Relevance</h2>

            <p className = "pl-5"><br />The goal of CFR Title 15 is to ensure that companies which will be 
                contracted by the U.S. have no affiliation with foreign countries that the U.S. deems as adversaries. 
                Specifically, this section will go over what is addressed in Part 791: <a href=
                "https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-E/part-791" target="_blank"> <u>Part 791 Link</u></a></p>

            <p className = "pl-5"><br />Part 791.1 outlines the purpose of this section, which is to determine 
                how CFR deals with software on a security front. It defines how authorities will handle software that 
                involves information and communication technology or services (ICTS). Part 791.2 outlines the formal 
                definitions of all terms within that section of the document; for our purposes, these formal terms are not 
                important in the scope of an overview but are worth reviewing if you would like to read the original documentation.</p>

            <p className = "pl-5"><br />Parts 791.3 and 791.4 are more crucial to the understanding of the limitations 
                imposed by CFR Title 15. The former part, 791.3, defines the types of software which would be deemed 
                to have ICTS, which is a very broadly defined category. It covers everything from common desktop applications, 
                AI, quantum computing software, and more; there are exceptions, but it is extremely limited. The latter part, 
                791.4, defines the current foreign adversaries of the United States. These include:</p>

            <ol className = "pl-10"><br />
                <li>1. The People&apos;s Republic of China, including the Hong Kong Special Administrative Region</li>
                <li>2. Republic of Cuba</li>
                <li>3. Islamic Republic of Iran</li>
                <li>4. Democratic People&apos;s Republic of Korea</li>
                <li>5. Russian Federation</li>
                <li>6. Venezuelan politician Nicolás Maduro</li>
            </ol>
            
            <p className = "pl-5"><br />Parts 791.5 to 791.7 contain legal information that outlines public 
                disclosure and the amendment process.</p>
            
            <p className = "pl-5"><br />The two following subparts, Subpart B and Subpart C, outline the 
                permissions authorities have available to them to investigate ICTS cases and the penalties 
                for not adhering to these requirements respectively.</p>

            {/* copy paste the below button(s) for each subpage */}
            <div className="container py-10 px-10 mx-0 min-w-full flex flex-col items-center">
                <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
                        aria-label="Back to Education Hub">
                    <Link href = "/education">Back to Education Hub</Link>
                </button>
            </div>
        </main>
    </>
    );
}