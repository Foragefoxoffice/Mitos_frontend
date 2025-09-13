"use client";
import "./globals.css";
import { SelectedTopicsProvider } from "@/contexts/SelectedTopicsContext";
import { SelectedQuestionTypesProvider } from "@/contexts/SelectedQuestionTypesContext";
import { TestProvider } from "@/contexts/TestContext";
import RouteGuard from "@/components/RouteGuard";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={` antialiased`}
        style={{ paddingRight: 0 }}
      >
        <TestProvider>
          <SelectedTopicsProvider>
            <SelectedQuestionTypesProvider>
              <RouteGuard>{children}</RouteGuard>
            </SelectedQuestionTypesProvider>
          </SelectedTopicsProvider>
        </TestProvider>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/turn.js/4.1.0/turn.min.js" />
      </body>
    </html>
  );
}
