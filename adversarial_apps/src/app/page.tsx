import Image from "next/image";

export default function Home() {
  return(
    <>
    <main>
        {/*main text goes here*/}
        <p className="pl-5"> <br />
            Welcome to Adversarial Apps:<br />
            Your resource for identifying Friendly and Adversarial Companies!
        </p>

        <h1 className="text-lg font-bold pl-5"><br />Powerful Search Tools</h1>

        <p className="pl-5"> 
            Our advanced search capabilities are designed to help you connect
            with businesses that align with Department of Defense (DoD)
            standards and <br /> security requirements. Features include: 
        </p>

        <ul className="list-disc pl-12">
            <li>DoD Compliance Checks: Discover companies compliant 
                with essential standards and regulations.</li>
            <li>SBIR, SAM, CFR: Access businesses aligned with federal programs like SBIR, 
                registered on SAM, and compliant with CFR guidelines.</li>
            <li>Risk-Based Identification: Filter companies based on their 
                risk factor to ensure safer, smarter partnerships.</li>
        </ul>

        <h1 className="text-lg font-bold pl-5"><br />Educational Resources</h1>
        <p className="pl-5">Stay informed with our Education Section, where you can explore how to 
            effectively assess companies and reduce your exposure to potential 
            risks. <br />Here, you'll find:</p>

        <ul className="list-disc pl-12">
            <li>Vetting Guides: Learn best practices for vetting companies and 
                understanding risk signals.</li>
            <li>Industry Insights: Access valuable articles and tutorials 
                to help you make data-driven, secure business decisions.</li>
        </ul>

        <p className="pl-5">Adversarial Apps: Empowering you to make trusted connections in 
            a complex business landscape.</p>
    </main>

    <footer>
        {/*images go here*/}
        <h1 className="mb-6 text-3xl font-semibold text-black">Sponsors: </h1>
        <div className= " flex flex-wrap justify-start space-x-4"> 
        {/*makes sure images are side by side and not below each other*/}
        <figure className="relative h-auto w-auto"> 
        <a 
      href="https://www.deftech.nc.gov" //link to Deftech website
      target="_blank" //Opens the link in a new tab
      rel="noopener noreferrer" // Recommended for security
      className="cursor-pointer" //Adds pointer cursor on hover
    >
            <Image
                src="/Deftech_Logo.png" //Deftech logo
                width={529}
                height={143}
                alt="Deftech Logo image"
            />
            </a>
            </figure>

            <figure className="relative h-auto w-auto">
            <a 
                href="https://www.nsin.mil" // link to NSIN website
                target="_blank" //Opens the link in a new tab
                rel="noopener noreferrer" // Recommended for security
                className="cursor-pointer" //Adds pointer cursor on hover
            >
            <Image
                src="/NSIN_Logo.png" //NSIN Logo
                width={451}
                height={103}
                alt="National Security Innovation Network Logo image"
            />
            </a>
        </figure>
        </div>

    </footer>
</>
  );
}
