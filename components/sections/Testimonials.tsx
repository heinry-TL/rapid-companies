"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

// Register the ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Define the testimonials data
const testimonials = [
  {
    id: 1,
    name: "Michael Chen",
    role: "CEO, TechVentures Global",
    quote:
      "Setting up our BVI company was seamless with Rapid Offshore. Their expertise and attention to detail made the entire process stress-free.",
    avatar: "/images/testimonial-1.jpg",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Founder, Wealth Strategies",
    quote:
      "The team at Rapid Offshore provided exceptional guidance for our Cayman Islands structure. Their knowledge of international tax planning is unmatched.",
    avatar: "/images/testimonial-2.jpg",
    rating: 5,
  },
  {
    id: 3,
    name: "Robert Kiyosaki",
    role: "Real Estate Investor",
    quote:
      "I&apos;ve worked with several offshore service providers, Rapid Offshore stands out for their professionalism and efficiency. Highly recommended!",
    avatar: "/images/testimonial-3.jpg",
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
                    <p className="text-white text-lg mb-6">
                      &quot;{testimonial.quote}&quot;
                    </p>

                    {/* Rating stars */}
                    <div className="flex mb-6">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${i < testimonial.rating
                              ? "text-yellow-400"
                              : "text-gray-600"
                            }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Author info */}
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full overflow-hidden mr-4 bg-gray-700">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">
                          {testimonial.name}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {testimonial.role}
                        </p>
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
