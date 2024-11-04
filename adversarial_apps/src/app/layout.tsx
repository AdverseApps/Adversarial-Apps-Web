import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Image from "next/image";



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
            backgroundColor: "#A0F6FF",
            width: 1920,
            height:93
          }}
          >
            <Image
              src="/Adversarial_Apps_Logo.png"
              width={302}
              height={68}
              alt="Adversarial Apps Logo"
            />

        </header>

      
        {children}
       
      </body>
    </html>
  );
}
