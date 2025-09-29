import Hero from "@/components/ui/Hero";
import Features from "@/components/sections/Features";
import Services from "@/components/Services";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/ui/Footer";

// Define the metadata for the page
export const metadata = {
  title:
    "Rapid Corporate Services Limited - Professional Offshore Company Formation",
  description:
    "Establish your offshore company with 20 years of professional formation services. We offer company incorporation in BVI, Cayman Islands, Seychelles, Panama, and more. Based in York, UK.",
};

// Define the Home component
export default function Home() {
  return (
    <div className="min-h-screen" >
    <main>
      <Hero />
      <Features />
      <Services />
      <Pricing />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
    </div>
  );
}
