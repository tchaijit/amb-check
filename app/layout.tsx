import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-thai",
});

export const metadata: Metadata = {
  title: "AMB Check - ระบบตรวจสอบรถพยาบาล / Ambulance Inspection System",
  description: "ระบบตรวจสอบความพร้อมใช้รถพยาบาล Bangkok Siriroj Hospital",
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={notoSansThai.variable}>
      <body className={`${notoSansThai.className} antialiased`}>
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            <header className="bg-primary text-white shadow-lg">
              <div className="container mx-auto px-4 py-4">
                <h1 className="text-xl font-bold">AMB Check System</h1>
                <p className="text-sm opacity-90">ระบบตรวจสอบความพร้อมรถพยาบาล / Ambulance Inspection</p>
              </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-6">
              {children}
            </main>

            <footer className="bg-gray-800 text-white text-center py-4">
              <p className="text-sm">Bangkok Siriroj Hospital - Ambulance Check System</p>
              <p className="text-xs text-gray-400 mt-1">Developed by BSI Informatics Dev Team © 2026</p>
            </footer>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
