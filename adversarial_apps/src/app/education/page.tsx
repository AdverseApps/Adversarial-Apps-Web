import Link from "next/link";
export default function page(){
    
    return (
        <>
        <main>
        {/*main text goes here*/}
            <h1 className="text-6xl font-bold pl-5">Education</h1>
            <p className="pl-5">Educate yourself on all things Government Compliance. 
                Your Journey to secure business starts here!</p>
                <p className="pl-5"><br /> Places tp start: <br /></p>
            
            <ul className="list-disc pl-12">
            <Link href = "education/cfr-title-15"><li>CFR Title 15</li></Link>
            <Link href = "education/sam-compliance"><li>SAM Compliance</li></Link>
            <Link href = "education/due-diligence"><li>Due Dilligence</li></Link>
            <Link href = "education/sbir"><li>SBIR Contract</li></Link>
            <Link href = "education/resources"><li>Resources</li></Link>
            <Link href = "education/cmmc"><li>CMMC 2.0</li></Link>
            <Link href = "education/foci"><li>FOCI</li></Link>
            {/* Need to add links to each page here */}
        </ul>
        </main>
        </>
    );
}