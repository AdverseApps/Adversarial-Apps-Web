import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
       <header 
          style={{
            backgroundColor: "#002759", //background color for the header
            width: 1920,
            height:93
          }}
          className ="drop-shadow-[0_4px_2px_rgba(255,255,255,1.0)]" //white drop shadow to separate header from main
          >
            <figure className="relative h-auto w-auto">
            <Link href = "/" className="inline-block"> 
            <Image //our logo image that links to home page
              src="/Adversarial_Apps_Logo.png"
              width={302}
              height={68}
              alt="Adversarial Apps Logo"
              className="ml-6"  // Adjust as needed
            />
            </Link>
            </figure>
        </header>

      
        {children}
       
      </body>
    </html>
  );
}