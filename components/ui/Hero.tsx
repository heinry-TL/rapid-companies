"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

// Define the Hero component
export default function Hero() {
  // Create references for the elements we want to animate
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // State to track if video is available and loaded
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Use useEffect to animate the elements with GSAP
  useEffect(() => {
    // Create a timeline
    const tl = gsap.timeline();

    // Add animations to the timeline
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.4" // Start slightly before the previous animation ends
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.4" // Start slightly before the previous animation ends
      );
  }, []);

  // Return the hero section
  return (
    <section className="relative overflow-hidden bg-gray-900 h-screen flex items-center">
      {/* Background - Video Only */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => {
            setVideoError(true);
            setVideoLoaded(false);
          }}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Video overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content container */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Text content */}
          <div>
            <h1
              ref={titleRef}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6"
            >
              Global Business <span className="text-blue-400">Solutions</span>{" "}
              for Your Offshore Needs
            </h1>
            <p ref={subtitleRef} className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Professional offshore company formation services with 20 years of experience
              tailored to your international business requirements.
            </p>
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/jurisdictions"
                className="px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-colors text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </a>
              <a
                href="#contact"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold text-lg rounded-lg hover:bg-white hover:text-gray-900 transition-colors text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center text-white/70 hover:text-white transition-colors cursor-pointer">
          <span className="text-sm mb-2">Scroll down</span>
          <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center">
            <div className="w-1 h-3 bg-current rounded-full animate-bounce mt-2"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
