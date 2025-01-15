export default function page(){
    return (
    <main aria-label="main-content">
        <h1 className="text-6xl font-bold pl-5">Cybersecurity Maturity Model Certification (CMMC)</h1>
        <h2 className="text-xl font-bold pl-5"><br />What is Cybersecurity Maturity Model Certification 
            (CMMC) 2.0? Is it replacing the need for NIST 800-171 compliance? </h2>
        <p className = "pl-5"><br />CMMC 2.0 is a certification that the federal government will begin requiring 
            entities working for the government to go through in 2025, with the goal of reaching Level 3 
            compliance by 2028. This is separate from the existing NIST 800-171 requirements, and CMMC serves 
            to be a set of steppingstones to reach NIST standards compliance.</p>
        <p className = "pl-5"><br />Each level of CMMC takes approximately 12-18 months to reach certification standards. 
            The Cybersecurity Assessor and Instructor of Certification Organization (CAICO) handles all CMMC 
            assessments for CMMC Level 1. For Levels 2 and 3, businesses must be assessed by an authorized CMMC 
            Third-Party Assessment Organization (C3PAO). Unlike CMMC, NIST 800-171 assessments can be self-reported 
            and are submitted to meet DoD contractor requirements.</p>
        <p className = "pl-5"><br />More information can be found here from the DoD&apos;s CIO website:
            <a href="https://dodcio.defense.gov/cmmc/About/" target="_blank"> <u>CMMC 2.0 About Page</u></a></p>
    </main>
    );
}