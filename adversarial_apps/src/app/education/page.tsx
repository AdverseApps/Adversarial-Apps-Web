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
        <div className="modules-container pt-4">
            <Module title="Module 1: CFR Title 15">
                <ul className="list-none">
                    <li><Link href = "education/cfr-title-15">CFR Title 15: Main Information</Link></li>
                </ul>
            </Module>
            <Module title="Module 2: SAM Compliance">
                <ul className="list-none">
                    <li><Link href = "education/sam-compliance">SAM Compliance: Main Information</Link></li>
                </ul>
            </Module>
            <Module title="Module 3: SBIR Due Diligence">
                <ul className="list-none">
                    <li><Link href = "education/sbir-due-diligence">SBIR Due Diligence: Main Information</Link></li>
                </ul>
            </Module>
            <Module title="Module 4: CMMC">
                <ul className="list-none">
                    <li><Link href = "education/cmmc">CMMC 2.0: Main Information</Link></li>
                </ul>
            </Module>
            <Module title="Module 5: FOCI">
                <ul className="list-none">
                    <li><Link href = "education/foci">FOCI: Main Information</Link></li>
                </ul>
            </Module>
            <Module title="Module 6: Resources">
                <ul className="list-none">
                    <li><Link href = "education/resources">Forms & Links</Link></li>
                </ul>
            </Module>
        </div>
    );
};

export default ModulesContainer;
