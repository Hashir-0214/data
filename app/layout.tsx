import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hajj Data",
  description: "Hajj Data Management",
};

import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Hajj Data" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        {session && (
          <header className="bg-white shadow">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="space-y-4">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Hajj Data <span className="text-indigo-600"></span>
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">Signed in as <span className="font-semibold">{session.username}</span></span>
                <LogoutButton />
              </div>
            </div>
          </header>
        )}
        <main className={session ? "mx-auto" : ""}>
          {children}
        </main>
      </body>
    </html>
  );
}
