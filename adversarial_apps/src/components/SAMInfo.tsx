"use client";
import { useState } from "react";
import Image from "next/image";

export default function SAMInfo() {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <span
      className="relative inline-block"
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
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-blue-800 text-white text-sm p-2 rounded shadow-lg transition-opacity duration-300 z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <p>
            SAM.gov registration lasts one year. If not renewed by the
            expiration date, the entity becomes ineligible for federal contracts
            until it's reactivated.
          </p>
          <p className="mt-2">
            <u>Note:</u> If a new registration was recently submitted, it may
            still be under review. In that case, the old expiration date will
            show until the renewal is approved.
          </p>
        </div>
      )}
    </span>
  );
}
