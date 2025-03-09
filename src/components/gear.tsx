'use client';
import Image from "next/image";
import { useState, useRef, useEffect } from "react";


export default function Gear({ showGearIcon }: { showGearIcon: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [isLightMode, setIsLightMode] = useState(false);

  // Toggle light mode
  const toggleLightMode = () => {
    setIsLightMode(!isLightMode);
  };
  // Close the modal when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Apply or remove the light-mode class on the body element
  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
  }, [isLightMode]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open settings"
        className="p-2" // Optional padding or styling
      >
        {showGearIcon ? (
          <Image
          src="/gear_settings_white.png" //image
          alt="Settings"
          width={32} // Adjust dimensions as needed
          height={32} // Adjust dimensions as needed
        />
        ) : (<p>Settings</p>)}
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div
            ref={modalRef}
            className={`modal p-4 rounded shadow-lg ${isLightMode ? 'bg-white text-black' : 'bg-gray-800 text-white'} bg-opacity-100`}
            role="dialog"
            aria-labelledby="settings-title"
            aria-describedby="settings-description"
          >
            <h2 id="settings-title" className="text-lg font-bold">
              Settings
            </h2>
            <p id="settings-description" className="text-sm">
              Adjust your preferences below.
            </p>
            {/* Settings content goes here */}
            <div className="space-y-4"> {/* Space between buttons */}
              {/* Light Mode Toggle */}
              <button onClick={toggleLightMode}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                aria-label={isLightMode ? "Switch to dark mode" : "Switch to light mode"}
              >
                {isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                aria-label="close settings panel"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
