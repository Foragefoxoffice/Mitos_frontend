"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SelectedTopicsProvider } from "@/contexts/SelectedTopicsContext";
import { SelectedQuestionTypesProvider } from "@/contexts/SelectedQuestionTypesContext";
import { TestProvider } from "@/contexts/TestContext";
import RouteGuard from "@/components/RouteGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{ paddingRight: 0 }}>
        <TestProvider>
          <SelectedTopicsProvider>
            <SelectedQuestionTypesProvider>
              <RouteGuard>
                {children}
              </RouteGuard>
            </SelectedQuestionTypesProvider>
          </SelectedTopicsProvider>
        </TestProvider>
        {/* Optional: load external JS here only if needed */}
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/turn.js/4.1.0/turn.min.js"
        />
      </body>
    </html>
  );
}
