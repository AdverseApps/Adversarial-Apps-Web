import Image from "next/image";
import SearchBar from "@/components/searchbar";

export default function Home() {
  return(
    <>
    <main>
        {/*main text goes here*/}
        <br /><br /><br /><br />
        <h1 className="text-4xl text-center font-bold"> <br />
            Adversarial Apps<br />
        </h1>

        <h3 className="text-2xl text-center"><br />
        Helping <span className="font-bold">You</span> Identify Friendly Business Partners
        </h3>

        <h5 className="text-lg text-center"><br /><br /><br />
        We offer an extensive database with powerful search tools to help you pursue your contracting goals
        </h5>
        
        <nav className="inset-0 flex items-center justify-center mt-9 gap-2 md:mt-8 ">
            <div className="w-2/5 rounded-sm"> 
            <SearchBar placeholder="Search..."  />
            </div>
        </nav>


    </main>

    <footer className="fixed bottom-0 mx-auto">
        {/*images go here*/}
        <h1 className="mb-6 text-3xl font-semibold">Sponsors: </h1>
        <div className= " flex flex-wrap justify-center space-x-4"> 
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
