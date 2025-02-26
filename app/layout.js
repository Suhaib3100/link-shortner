import { Geist, Geist_Mono } from "next/font/google";
import { Background5 } from "@/once-front/src/once-ui/pro/Background5";
import { Cookie1 } from "@/once-front/src/once-ui/pro/Cookie1";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Link Shortner",
  description: "A simple link shortner",
};



export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} ${geistMono.variable} antialiased`}
      >
        <Background5 />
        {children}
        <Cookie1 />
      </body>
    </html>
  );
}