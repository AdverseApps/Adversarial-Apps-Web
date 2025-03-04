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

            <p className = "pl-5"><br />CFR Title 15 specifically states the purpose of the 
                Office of the Secretary of Commerce and, among other established codifications, 
                the authority it has over foreign trade. Many of its 
                regulations detailed in Subtitle B regard different bureaus related to the 
                Department of Commerce, such as the Bureau of the Census, the National Institute 
                of Standards and Technology, and the International Trade Administration which name 
                three of the fifteen government bodies affected by this title. We are mostly interested 
                in the Bureau of Industry and Security, which is addressed in Chapter VII of Subtitle 
                B, particularly the section that covers the technology supply chain in Part 791. </p>

            <h2 className="text-xl font-bold pl-5"><br />What is CFR Title 15, Part 791? 
                A Concise Breakdown of Its Documentation and Its Relevance</h2>

            <p className = "pl-5"><br />The goal of CFR Title 15 is to better regulate commerce and
                foreign trade, which Part 791 in turn addresses potentially harmful technologies and 
                U.S. adversaries that could affect the foreign supply chain. Please refer to the legal 
                documentation shown in the resources page for information regarding parts other than Part 791.</p>

            <p className = "pl-5"><br />Part 791.1 outlines the purpose of this section, including the 
                procedures as to how the Secretary of Commerce will take actions regarding entities that 
                are or involve information and communication technology or services (ICTS). Part 791.2 outlines the formal 
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

            {/* copy paste the below buttons for each subpage; make sure to relink */}
            <div className="container py-10 px-10 mx-0 min-w-full flex justify-center items-center space-x-4">

                <Link href = "/education" passHref legacyBehavior>
                    <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
                        aria-label="Back to Education Hub">
                        Back to Education Hub
                    </button>
                </Link>

                <Link href = "/education/sam-compliance" passHref legacyBehavior>
                    <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
                        aria-label="Next Page">
                        Next Page
                    </button>
                </Link>
            </div>
            
        </main>
    </>
    );
}