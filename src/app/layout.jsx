"use client";

import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SelectedTopicsProvider } from "@/contexts/SelectedTopicsContext";
import { SelectedQuestionTypesProvider } from "@/contexts/SelectedQuestionTypesContext";
import { TestProvider } from "@/contexts/TestContext";
import RouteGuard from "@/components/RouteGuard";
import LoadingScreen from "@/components/LoadingScreen"; // Create this component for better UX

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"], 
});

export default function RootLayout({ children }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state instead of null for better UX
  if (!isClient) {
    return <LoadingScreen />;
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased `} style={{paddingRight:0}} >
        <TestProvider>
          <SelectedTopicsProvider>
            <SelectedQuestionTypesProvider>
              <RouteGuard>
                {children}
              </RouteGuard>
            </SelectedQuestionTypesProvider>
          </SelectedTopicsProvider>
        </TestProvider>
        <script 
          src="https://cdnjs.cloudflare.com/ajax/libs/turn.js/4.1.0/turn.min.js" 
          strategy="beforeInteractive" // Better loading strategy
        />
      </body>
    </html>
  );
}