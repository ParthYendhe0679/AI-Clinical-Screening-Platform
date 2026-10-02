import type { Metadata, Viewport } from "next";
import { Poppins, Unbounded } from "next/font/google";
import "./globals.css";
import { SimDriver } from "@/components/features/sim-driver";

const display = Unbounded({ subsets: ["latin"], weight: ["500", "600", "700", "800"], display: "swap", variable: "--font-unbounded" });
const sans = Poppins({ subsets: ["latin", "devanagari"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "EL-04 Clinical Screening Platform — frontend prototype",
  description: "Multimodal AI clinical screening & intelligence platform. Frontend prototype with fictional demo data and simulated AI. Not a medical diagnosis.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f5f1e8" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        {children}
        <SimDriver />
      </body>
    </html>
  );
}
