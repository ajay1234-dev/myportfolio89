import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import CustomCursor from "@/components/CustomCursor";
import LenisProvider from "@/components/LenisProvider";
import { AuthProvider } from "@/components/AuthProvider";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ajay Singh I — Full Stack & Cloud/DevOps Engineer",
  description:
    "Portfolio of Ajay Singh I, a Full Stack Developer and Cloud/DevOps Engineer building scalable systems and infrastructure that power products used by millions.",
  keywords: [
    "full stack developer",
    "devops engineer",
    "cloud engineer",
    "AWS",
    "Next.js",
    "Kubernetes",
    "Terraform",
  ],
  openGraph: {
    title: "Ajay Singh I — Full Stack & Cloud/DevOps Engineer",
    description: "Building scalable systems that power products used by millions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <AuthProvider>
          <LenisProvider />
          <ScrollProgress />
          <CustomCursor />
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
