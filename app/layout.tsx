import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppHeaderWrapper } from "@/components/ui/Header";
import { PortfolioProvider } from "@/lib/portfolio-context";
import { usePathname } from "next/navigation";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

// Define metadata for the website
export const metadata: Metadata = {
  title: "Offshore Company Formation Services",
  description:
    "Professional offshore company formation services for international business needs",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/icon.svg',
  },
};

// Define the RootLayout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Return the layout structure with header, main content, and footer
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isAdmin = pathname.startsWith('/alpha-console');
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-900 text-white min-h-screen flex flex-col`}
      >
        <PortfolioProvider>
          {!isAdmin && <AppHeaderWrapper />}
          <main className="flex-grow">{children}</main>
        </PortfolioProvider>
      </body>
    </html>
  );
}
