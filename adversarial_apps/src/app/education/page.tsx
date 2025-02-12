'use client';
import React from "react";
import Link from "next/link";

type ModuleProps = {
    title: string;
    children: React.ReactNode;
};

const Module: React.FC<ModuleProps> = ({ title, children }) => {
    const id = title.replace(/\s+/g, '-').toLowerCase();
    return (
        <details className="module w-full max-w-lg mx-auto rounded-lg shadow-md overflow-hidden mb-4 border-2 border-solid">
            <summary
                id={`${id}-title`} 
                className="module-header bg-blue-800 p-4 cursor-pointer flex justify-between items-center text-lg"
                aria-expanded="false"
                aria-controls={`${id}-content`}
                onClick={(e) => {
                    const details = e.currentTarget.parentElement as HTMLDetailsElement;
                    e.currentTarget.setAttribute("aria-expanded", details.open.toString());
                }}
            >
                {title}
                <span className="arrow transition-transform">&#9660;</span>
            </summary>
            <div id={`${id}-content`} className="module-content p-4">{children}</div>
        </details>
    );
};

/* list of modules; can be further expanded later via adding new pages to each list */
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
