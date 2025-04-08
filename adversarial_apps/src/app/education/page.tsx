'use client';
import React, { useState } from "react";
import Link from "next/link";

type ModuleProps = {
    title: string;
    children: React.ReactNode;
};

const Module: React.FC<ModuleProps> = ({ title, children }) => {
    const id = title.replace(/\s+/g, '-').toLowerCase();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <details
            className={`module w-full max-w-lg mx-auto rounded-lg shadow-md overflow-hidden mb-4 border-2 border-solid text-white ${isOpen ? 'bg-gray-800' : 'bg-transparent'}`}
            open={isOpen}
            onToggle={(e) => setIsOpen(e.currentTarget.open)}
        >
            <summary
                id={`${id}-title`}
                className={`module-header bg-blue-900 p-4 cursor-pointer flex justify-between items-center text-lg focus:text-yellow-300 focus:font-bold`}
                aria-expanded={isOpen}
                aria-controls={`${id}-content`}
            >
                {title}
                <span className={`arrow transition-transform ${isOpen ? "rotate-90" : "rotate-270"}`}>
                    &#9654;
                </span>
            </summary>
            <div id={`${id}-content`} className="module-content p-4 bg-gray-800">{children}</div>
        </details>
    );
};

{/* list of modules; can be further expanded later via adding new pages to each list */}
const ModulesContainer: React.FC = () => {
    return (
        <div className="modules-container pt-4 px-6">
            {/* Header Section */}
            <header className="text-center mb-6">
                <h1 className="text-3xl font-bold">Stay Informed!</h1>
                <p className="text-lg mt-2">
                    We at Adversarial Apps want you to be educated when going through the process of signing
                    up for your contracts. We have compiled our research into various areas of the application
                    and legal aspects here, but it is by no means complete; <u>we urge you to do your own
                    research as well.</u> This is intended to help you get started on investigating relevant
                    laws and information.
                </p>
            </header>

            {/* Modules List */}
            <div className="justify-evenly align-middle" aria-label="main-content">
                <Module title="Module 1: CFR Title 15">
                    <p>
                        This module goes over the legislation introduced by the Code of Federal Regulations (CFR) Title 15, which has impacts on
                        what technologies companies can use and who they cannot associate with.
                    </p>
                    <br></br><hr></hr><br></br>
                    <ul className="list-none">
                        <li><Link href="education/cfr-title-15/page">CFR Title 15: Main Information</Link></li>
                        <li><Link href="education/cfr-title-15/resources">CFR Title 15: Resources</Link></li>
                    </ul>
                </Module>
                <Module title="Module 2: SAM Compliance">
                    <p>
                        This module goes over the System for Award Management (SAM) website and its registration process.
                    </p>
                    <br></br><hr></hr><br></br>
                    <ul className="list-none">
                        <li><Link href="education/sam-compliance/page">SAM Compliance: Main Information</Link></li>
                        <li><Link href="education/sam-compliance/resources">SAM Compliance: Resources</Link></li>
                    </ul>
                </Module>
                <Module title="Module 3: SBIR Due Diligence">
                    <p>
                        This module goes over requirements for the Due Diligence program, as well as detailing
                        what is necessary to obtain SBIR and STTR grants.
                    </p>
                    <br></br><hr></hr><br></br>
                    <ul className="list-none">
                        <li><Link href="education/sbir-due-diligence/page">SBIR Due Diligence: Main Information</Link></li>
                        <li><Link href="education/sbir-due-diligence/resources">SBIR Due Diligence: Resources</Link></li>
                    </ul>
                </Module>
                <Module title="Module 4: CMMC">
                    <p>
                        This module goes over the new Cybersecurity Maturity Model Certification (CMMC) 2.0 program and its initiative to increase
                        cybersecurity standards across contracted entities.
                    </p>
                    <br></br><hr></hr><br></br>
                    <ul className="list-none">
                        <li><Link href="education/cmmc/page">CMMC 2.0: Main Information</Link></li>
                        <li><Link href="education/cmmc/resources">CMMC 2.0: Resources</Link></li>
                    </ul>
                </Module>
                <Module title="Module 5: FOCI">
                    <p>
                        This module further details Foreign Ownership Control and Influence, an attribute
                        addressed in CFR Title 15.
                    </p>
                    <br></br><hr></hr><br></br>
                    <ul className="list-none">
                        <li><Link href="education/foci/page">FOCI: Main Information</Link></li>
                        <li><Link href="education/foci/resources">FOCI: Resources</Link></li>
                    </ul>
                </Module>
            </div>
        </div>
    );
};

export default ModulesContainer;
