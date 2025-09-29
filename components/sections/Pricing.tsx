"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

// Register the ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Define the pricing plans
const pricingPlans = [
  {
    id: "company-formation",
    name: "Offshore Company Formation",
    price: 599,
    description:
      "Perfect for small businesses looking to establish an offshore presence.",
    features: [
      "Company incorporation",
      "Registered office address (1 year)",
      "Registered agent (1 year)",
      "Standard articles of incorporation",
      "Certificate of incorporation",
      "Digital company documents",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "offshore-banking",
    name: "Offshore Banking",
    price: 999,
    description: "Ideal for growing businesses requiring additional services.",
    features: [
      "Everything in Basic",
      "Corporate bank account assistance",
      "Company seal",
      "Apostille certification",
      "Nominee director (1 year)",
      "Priority processing",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "formation + banking",
    name: "Offshore Company Formation + Offshore Banking",
    price: 1899,
    description:
      "Comprehensive solution for established businesses with complex needs.",
    features: [
      "Everything in Professional",
      "Tax consultation (2 hours)",
      "Corporate structure planning",
      "Nominee shareholder (1 year)",
      "Multiple jurisdictions setup",
      "Dedicated account manager",
    ],
    cta: "Get Started",
    popular: true,
  },
];

// Define the Pricing component
export default function Pricing() {
  // Create a reference for the section
  const sectionRef = useRef<HTMLElement>(null);
  // Create a reference for the title
  const titleRef = useRef<HTMLDivElement>(null);
  // Create references for the pricing cards
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Set up GSAP animations with ScrollTrigger
  useEffect(() => {
    // Skip if window is not defined (SSR)
    if (typeof window === "undefined") return;

    // Animate the title
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
        },
      }
    );

    // Animate each pricing card
    cardRefs.current.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.2 + index * 0.2, // Stagger the animations
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        }
      );
    });

    // Clean up ScrollTrigger instances on component unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Return the pricing section
  return (
    <section ref={sectionRef} id="pricing" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Section title */}
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Transparent <span className="text-blue-400">Pricing</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Choose the right plan for your offshore company formation needs with
            our all-inclusive packages.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.id}
              ref={(el) => {cardRefs.current[index] = el}}
              className={`rounded-xl p-8 transition-all duration-300 relative ${
                plan.popular
                  ? "bg-gradient-to-b from-blue-900 to-gray-800 border-2 border-blue-500 transform hover:-translate-y-2"
                  : "bg-gray-900 border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-xl font-semibold text-white mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline mb-5">
                <span className="text-3xl font-bold text-white">
                  £{plan.price}
                </span>
                <span className="text-gray-400 ml-1">/ one-time</span>
              </div>
              <p className="text-gray-400 mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/register?plan=${plan.id}`}
                className={`w-full block text-center py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="text-center mt-12 text-gray-400">
          <p>
            All plans include 24/7 customer support and a 30-day satisfaction
            guarantee.
          </p>
          <p className="mt-2">
            Need a custom solution?{" "}
            <a href="#contact" className="text-blue-400 hover:text-blue-300">
              Contact us
            </a>{" "}
            for personalized pricing.
          </p>
        </div>
      </div>
    </section>
  );
}
