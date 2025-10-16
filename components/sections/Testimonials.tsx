"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { title } from "process";

// Register the ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Define the testimonials data
const testimonials = [
  {
    id: 1,
    name: "Simon Mercer ",
    title: "BVI Company + Bank Account",
    quote:
      "Rapid sorted our BVI company and bank setup super fast. Clear process, good communication, and everything worked exactly as promised. Highly recommended.",
    rating: 5,
  },
  {
    id: 2,
    name: "Olivia Hartley ",
    title: "Jersey Company Structure",
    quote:
      "Our Jersey company was set up quickly and properly. The structure fits our needs perfectly, and the team explained every step in plain English.",
    rating: 5,
  },
  {
    id: 3,
    name: "Marcus Linton",
    title: "BVI Company + Bank Account",
    quote:
      "The Horizon Overview was genuinely a game changer. It gave us a really clear view to expand internationally with confidence. Worth every penny.",
    rating: 4,
  },
  {
    id: 4,
    name: "Anonymous Client",
    title: "Belize Trust Formation",
    quote:
      "We used Rapid to create a Belize trust to protect some property that my family has acquired over the last few years. Straightforward advice (which cleared up some pretty useful questions), quick turnaround, and total peace of mind.",
    rating: 4,
  },
];

// Define the Testimonials component
export default function Testimonials() {
  // Create a reference for the section
  const sectionRef = useRef<HTMLElement>(null);
  // Create a reference for the title
  const titleRef = useRef<HTMLDivElement>(null);
  // Create a reference for the testimonials container
  const testimonialsRef = useRef<HTMLDivElement>(null);

  // State for the active testimonial
  const [activeIndex, setActiveIndex] = useState(0);

  // Function to handle next testimonial
  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  // Function to handle previous testimonial
  const handlePrev = () => {
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length
    );
  };

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

    // Animate the testimonials container
    gsap.fromTo(
      testimonialsRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.2,
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: "top 80%",
        },
      }
    );

    // Clean up ScrollTrigger instances on component unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Return the testimonials section
  return (
    <section ref={sectionRef} id="testimonials" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section title */}
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Client <span className="text-blue-400">Testimonials</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Hear what our clients have to say about their experience with our
            offshore company formation services.
          </p>
        </div>

        {/* Testimonials carousel */}
        <div ref={testimonialsRef} className="max-w-4xl mx-auto relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                    {/* Quote */}
                    <div className="mb-6">
                      <svg
                        className="h-8 w-8 text-blue-400 opacity-50"
                        fill="currentColor"
                        viewBox="0 0 32 32"
                      >
                        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                      </svg>
                    </div>

                    {/* Testimonial content */}
                    <p className="text-white text-xl font-semibold mb-2">
                      {testimonial.title}
                    </p>
                    <p className="text-white font-medium mb-6 italic">
                      &quot;{testimonial.quote}&quot;
                    </p>

                    {/* Author info */}
                    <div className="flex items-center">
                      <div>
                        <h4 className="text-white font-medium">
                          - {testimonial.name}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={handlePrev}
            className="absolute top-1/2 -left-4 transform -translate-y-1/2 h-10 w-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Previous testimonial"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 h-10 w-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Next testimonial"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Dots indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all ${index === activeIndex ? "w-8 bg-blue-500" : "w-2 bg-gray-600"
                  }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
