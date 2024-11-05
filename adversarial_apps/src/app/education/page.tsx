import Link from "next/link";

export default function page(){
    return (
        <>
        {/*main text goes here*/}
            <h1 className="text-6xl font-bold pl-5"><br />Education</h1>
            <p className="pl-5">Educate yourself on all things Government Compliance. 
                Your Journey to secure business starts here!</p>
                <p className="pl-5"><br /> Places tp start: <br /></p>
            
            <ul className="list-disc pl-12">
            <li>CFR Title 15</li>
            <li>SAM Compliance</li>
            <li>Due Dilligence</li>
            <li>SBIR Contract</li>
            <li>Resources</li>
            {/* Need to add links to each page here */}
        </ul>
        </>
    );
}