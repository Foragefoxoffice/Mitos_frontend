import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SelectedTopicsProvider } from "@/contexts/SelectedTopicsContext";
import { SelectedQuestionTypesProvider } from "@/contexts/SelectedQuestionTypesContext";
import { TestProvider } from "@/contexts/TestContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TestProvider><SelectedTopicsProvider>  <SelectedQuestionTypesProvider>{children} </SelectedQuestionTypesProvider></SelectedTopicsProvider></TestProvider> 
        <script src="https://cdnjs.cloudflare.com/ajax/libs/turn.js/4.1.0/turn.min.js"></script>

      </body>
    </html>
  );
}
