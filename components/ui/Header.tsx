"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { usePortfolio } from "@/lib/portfolio-context";

// Define the Header component
export default function Header() {
  // State for mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // State for scroll position
  const [isScrolled, setIsScrolled] = useState(false);
  // Get the current pathname
  const pathname = usePathname();
  // Get portfolio state
  const { state } = usePortfolio();

  // Calculate total items in portfolio
  const totalItems = state.applications.length + state.standaloneServices.length + (state.mailForwarding ? 1 : 0) + (state.trustFormation ? 1 : 0);

  // Handle scroll for transparency effect (only on homepage)
  useEffect(() => {
    const handleScroll = () => {
      // Only apply transparency behavior on homepage
      if (pathname === '/') {
        // Change navbar only after scrolling past the full hero section (100vh)
        setIsScrolled(window.scrollY > window.innerHeight);
      } else {
        // On other pages, navbar should always have background
        setIsScrolled(true);
      }
    };

    handleScroll(); // Call immediately to set initial state

    if (pathname === '/') {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (pathname === '/') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Return the header component
  return (
    <>
      {/* Top Contact Bar - Sticky */}
      <div className={`fixed top-0 left-0 right-0 text-sm z-50 transition-all duration-300 ${isScrolled
        ? 'bg-gray-900/95 backdrop-blur-sm text-gray-300 border-b border-gray-800'
        : 'bg-white text-gray-800 border-b border-gray-200'
        }`}>
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +44 1904 925 200
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@rapidcompanies.com
              </div>
            </div>
            <div className={`hidden md:block text-xs ${isScrolled ? 'text-gray-400' : 'text-gray-600'}`}>
              Professional Offshore Company Formation Services
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`fixed top-8 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-gray-900/95 backdrop-blur-sm' : 'bg-transparent'
        }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/offshore-rapid-logo-white.png"
                  alt="Rapid Offshore Logo"
                  width={400}
                  height={120}
                  className={`h-20 w-auto transition-all duration-300 ${
                    !isScrolled && pathname === '/'
                      ? 'brightness-0 invert'
                      : ''
                  }`}
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <NavLink href="/" label="Home" />
              <NavLink href="/services" label="Services" />
              <NavLink href="/jurisdictions" label="Jurisdictions" />
              <NavLink href="/contact" label="Contact" />

              {/* Portfolio Icon */}
              <Link
                href="/portfolio"
                className="relative flex items-center text-gray-300 hover:text-blue-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.nav
              className="md:hidden mt-4 pb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-4">
                <MobileNavLink href="/" label="Home" />
                <MobileNavLink href="/services" label="Services" />
                <MobileNavLink href="/jurisdictions" label="Jurisdictions" />
                <MobileNavLink href="/pricing" label="Pricing" />
                <MobileNavLink href="/contact" label="Contact" />

                {/* Mobile Portfolio Link */}
                <Link
                  href="/portfolio"
                  className="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Portfolio ({totalItems})
                </Link>
              </div>
            </motion.nav>
          )}
        </div>
      </header>
    </>
  );
}

export function AppHeaderWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith('/alpha-console')) return null;
  return <Header />;
}

// NavLink component for desktop navigation
function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-blue-400 ${isActive ? "text-blue-400" : "text-gray-300"
        }`}
    >
      {label}
    </Link>
  );
}

// MobileNavLink component for mobile navigation
function MobileNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`text-base font-medium transition-colors hover:text-blue-400 ${isActive ? "text-blue-400" : "text-gray-300"
        }`}
    >
      {label}
    </Link>
  );
}
