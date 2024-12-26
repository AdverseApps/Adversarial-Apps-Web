import Image from "next/image";
import SearchBar from "@/components/searchbar";

export default function Home() {
  return(
    <div className="flex flex-col h-auto"> {/* Full height container, by doing h-auto it removes the scroll bar */}
         <br /> <br /> <br /> <br />
            <main className="flex-grow" aria-label="main-content">
                {/*main text goes here*/}
                
                <h1 className="text-4xl text-center font-bold"> <br />
                    Adversarial Apps<br />
                </h1>

                <h2 className="text-2xl text-center"><br />
                Helping <strong>You</strong> Identify Friendly Business Partners
                </h2>

                <p className="text-lg text-center"><br /><br />
                We offer an extensive database with powerful search tools to help you pursue your contracting goals
                </p>
                
                <nav className="inset-0 flex items-center justify-center mt-9 gap-2 md:mt-8 ">
                    <div className="w-2/5 rounded-sm"> 
                    <SearchBar placeholder="Search..." aria-label="Search for business partners" />
                    </div>
                </nav>


            </main>
      
        <footer className="text-white"> {/* dont add flex or it will mess upo sponsor logos* */}
            <h1 className="mb-1 text-xl font-semibold text-center text-white">Sponsors</h1>
            
            <div className="flex justify-center items-center gap-4" aria-label="Sponsor logos">
            <figure className="p-2">
                <a
                 href="https://www.deftech.nc.gov" //link to Deftech website
                 target="_blank" //Opens the link in a new tab
                 rel="noopener noreferrer" // Recommended for security
                 className="cursor-pointer" //Adds pointer cursor on hover
                 aria-label="Visit NCDeftech website"
                >
                <Image
                    src="/Deftech_Logo.png" //Deftech logo
                    width={200}
                    height={60}
                    alt="NCDeftech Logo"
                />
                </a>
            </figure>

            <figure className="p-2">
                <a
                 href="https://www.nsin.mil" // link to NSIN website
                 target="_blank" //Opens the link in a new tab
                 rel="noopener noreferrer" // Recommended for security
                 className="cursor-pointer" //Adds pointer cursor on hover
                 aria-label="Visit National Security Innovation Network website"
                >
                <Image
                    src="/NSIN_Logo.png" //NSIN Logo
                    width={200}
                    height={60}
                    alt="National Security Innovation Network Logo"
                />
                </a>
            </figure>
            </div>
        
        </footer>
    </div>
  );
}