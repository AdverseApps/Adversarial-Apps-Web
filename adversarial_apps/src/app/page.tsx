import Image from "next/image";
import Link from 'next/link';
export default function Home() {
  return(
    <footer>
        <h1 className="mb-6 text-[37px] font-semibold text-black">Sponsors: </h1>
        <div className= " flex flex-wrap justify-start space-x-4">
        
        <div className="relative h-auto w-auto">
            <Image
                src="/Deftech_Logo.png" 
                width={529}
                height={143}
                alt="Deftech Logo"
            />
            </div>
            <div className="relative h-auto w-auto">
            <Image
                src="/NSIN_Logo.png" 
                width={451}
                height={103}
                alt="National Security Innovation Network Logo"
            />
        </div>
        </div>

    </footer>
  );
}
