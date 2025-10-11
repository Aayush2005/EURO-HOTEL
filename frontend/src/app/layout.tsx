import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "EURO HOTEL",
  description: "Premium Hotel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#F8F6F3',
                color: '#2C2C2C',
                border: '1px solid #F0EDE8',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
              },
              success: {
                iconTheme: {
                  primary: '#C9A227',
                  secondary: '#F8F6F3',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#F8F6F3',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
