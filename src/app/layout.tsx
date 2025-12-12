import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ARK Dashboard",
  description: "Impact-to-Earn Platform for the ARK Community",
};

import { Web3Provider } from "@/components/Web3Provider";
import { UserProvider } from "@/context/UserContext";
import { Toaster } from "sonner";
import AuthGuard from "@/components/AuthGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Web3Provider>
          <UserProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
            <Toaster position="bottom-right" theme="dark" richColors />
          </UserProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
