'use client';
import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import SearchBar from "@/components/searchbar";
import Link from "next/link";
import Gear from "./gear"

const EducationSubNavBar = ({ isSubMenuOpen }: { isSubMenuOpen: boolean }) => {
  return (
    <div
      id="education-submenu"
      role="menu"
      aria-labelledby="education-menu"
      className={`absolute left-1/2 transform -translate-x-1/2 ${
        isSubMenuOpen ? 'block' : 'hidden'
      } bg-blue-800 text-white rounded-lg p-4 mt-2 shadow-lg`}
    >
      <ul className="flex space-x-6">
        <li><Link href="/education/cfr-title-15" className="block py-1 hover:bg-blue-700 px-2 whitespace-nowrap">CFR Title 15</Link></li>
        <li><Link href="/education/sam-compliance" className="block py-1 hover:bg-blue-700 px-2 whitespace-nowrap">SAM Compliance</Link></li>
        <li><Link href="/education/due-diligence" className="block py-1 hover:bg-blue-700 px-2 whitespace-nowrap">Due Diligence</Link></li>
        <li><Link href="/education/sbir" className="block py-1 hover:bg-blue-700 px-2 whitespace-nowrap">SBIR Contract</Link></li>
        <li><Link href="/education/resources" className="block py-1 hover:bg-blue-700 px-2 whitespace-nowrap">Resources</Link></li>
        <li><Link href="/education/cmmc" className="block py-1 hover:bg-blue-700 px-2 whitespace-nowrap">CMMC 2.0</Link></li>
        <li><Link href="/education/foci" className="block py-1 hover:bg-blue-700 px-2 whitespace-nowrap">FOCI</Link></li>
      </ul>
    </div>
  );
};

export default function NavBar() {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  // Handler to open submenu when focusing or hovering
  const openSubMenu = () => setIsSubMenuOpen(true);

  // Handler to close submenu when focus moves outside
  const closeSubMenu = (e: FocusEvent) => {
    if (navRef.current && !navRef.current.contains(e.relatedTarget as Node)) {
      setIsSubMenuOpen(false);
    }
  };

  useEffect(() => {
    const navElement = navRef.current;
    if (navElement) {
      navElement.addEventListener('focusout', closeSubMenu);
    }
    return () => {
      if (navElement) {
        navElement.removeEventListener('focusout', closeSubMenu);
      }
    };
  }, []);

  return (
    <header className="bg-blue-900 grid grid-cols-3 items-center p-4 shadow-md">
      {/* Logo */}
      <div className="flex justify-start ml-4">
        <Link href="/" aria-label="Go to home page">
        <Image 
            src="/Adversarial_Apps_Logo.png"
            width={250}  
            height={200}
            alt="Adversarial Apps Logo"
            className="cursor-pointer"
          />
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex justify-center space-x-6 relative" ref={navRef}>
        <div className="hover:bg-blue-950 p-2 rounded-lg transition duration-200">
          <Link aria-label="Go to Home Page" href="/" className="text-white text-xl">
            Home
          </Link>
        </div>

        <div
          className="group relative hover:bg-blue-950 p-2 rounded-lg transition duration-200"
          onMouseEnter={openSubMenu}
          onMouseLeave={() => setIsSubMenuOpen(false)}
        >
          <Link
            aria-label="Go to education page"
            id="education-menu"
            href="/education"
            className="text-white text-xl"
            aria-haspopup="true" 
            aria-expanded={isSubMenuOpen ? "true" : "false"}
            aria-controls="education-submenu"
            onFocus={openSubMenu}
          >
            Education
          </Link>
          {/* Submenu for education */}
          <EducationSubNavBar isSubMenuOpen={isSubMenuOpen} />
        </div>

        <div className="hover:bg-blue-950 p-2 rounded-lg transition duration-200">
          <Link aria-label="Go to search page" href="/search" className="text-white text-xl">
            Search
          </Link>
        </div>
      </nav>

      
      <div className="flex justify-end mr-6 p-2 rounded-lg">
        {/* Search Bar Component */}
        <div className=" pt-1.5">
          <SearchBar placeholder="Search..." aria-label="Search for business partners" />
        </div>
      
        {/* Gear Settings Component */}
        <div>
          <Gear />
        </div>
      </div>
    </header>
  );
}