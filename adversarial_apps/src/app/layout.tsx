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
            backgroundColor: "#B1CEF2", //background color for the header
            width: 1920,
            height:93
          }}
          >
            <figure className="relative h-auto w-auto">
            <Link href = "/">
            <Image //our logo image
              src="/Adversarial_Apps_Logo.png"
              width={302}
              height={68}
              alt="Adversarial Apps Logo"
            />
            </Link>
            </figure>
        </header>

      
        {children}
       
      </body>
    </html>
  );
}
