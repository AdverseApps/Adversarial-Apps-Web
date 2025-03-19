"use client";
import { useRef, useState } from "react";
import Image from "next/image";

export default function RiskScoreTooltip() {
  const [isHovered, setIsHovered] = useState(false);
  // Used a timed interval to fix a bug in the popup
  const timeoutId = useRef<NodeJS.Timeout | number | undefined>(undefined); 

  const handleMouseEnter = () => {
    clearTimeout(timeoutId.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutId.current = setTimeout(() => {
      setIsHovered(false);
    }, 150); // Adjust delay (milliseconds) as needed
  };

  return (
    <div
      className="relative inline-block" // Use inline-block for better sizing
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src="/info.png"
        height={20}
        width={20}
        alt="Info"
        className="invert cursor-pointer"
      />

      {isHovered && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-blue-800 text-white text-sm p-2 rounded shadow-lg transition-opacity duration-300"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <p>A lower score indicates a lower risk based on our evaluation scale.</p>
          <u>Our assessment process includes subjective elements</u>; 
          please visit our <a href='https://adversarialapps.com/about' target='_blank' className="underline hover:text-blue-200">About</a> page for more details on our evaluation criteria.
        </div>
      )}
    </div>
  );
}