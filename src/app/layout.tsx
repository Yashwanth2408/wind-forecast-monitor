import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Wind Forecast Monitor — UK National Grid",
  description: "UK national wind power generation forecast accuracy monitoring using live Elexon BMRS data.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D0B12",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body style={{ background: "#0D0B12", color: "#E8E6F0", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
