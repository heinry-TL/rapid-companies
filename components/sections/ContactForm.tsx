"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitFormData, FormSubmission } from "@/lib/supabase";

// Define the form validation schema using Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(5, { message: "Please enter a valid phone number" }),
  companyName: z
    .string()
    .min(2, { message: "Company name must be at least 2 characters" }),
  country: z.string().min(1, { message: "Please select a country" }),
  serviceType: z.string().min(1, { message: "Please select a service type" }),
  message: z.string().optional(),
});

// Define the props for the ContactForm component
type ContactFormProps = {
  preselectedCountry?: string;
  preselectedService?: string;
};

// Define the ContactForm component
export default function ContactForm({
  preselectedCountry,
  preselectedService,
}: ContactFormProps) {
  // Set up form state using react-hook-form with zod validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: preselectedCountry || "",
      serviceType: preselectedService || "",
    },
  });

  // State for form submission status
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Prepare the form data
      const formData: FormSubmission = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        country: data.country,
        serviceType: data.serviceType,
        message: data.message,
      };

      // Submit the form data to Supabase
      await submitFormData(formData);

      // Reset the form and set success status
      reset();
      setFormStatus("success");

      // Reset the form status after 5 seconds
      setTimeout(() => {
        setFormStatus("idle");
      }, 5000);
    } catch (error) {
      // Set error status
      console.error("Form submission error:", error);
      setFormStatus("error");

      // Reset the form status after 5 seconds
      setTimeout(() => {
        setFormStatus("idle");
      }, 5000);
    }
  };

  // Return the contact form
  return (
    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
      {/* Form status messages */}
      {formStatus === "success" && (
        <div className="mb-6 p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-400">
          Thank you for your inquiry! We&apos;ll get back to you shortly.
        </div>
      )}

      {formStatus === "error" && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-400">
          There was an error submitting your form. Please try again.
        </div>
      )}

      {/* Contact form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              className={`w-full px-4 py-2 bg-gray-700 border ${
                errors.name ? "border-red-500" : "border-gray-600"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
              placeholder="John Doe"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              className={`w-full px-4 py-2 bg-gray-700 border ${
                errors.email ? "border-red-500" : "border-gray-600"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
              placeholder="john@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone field */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              className={`w-full px-4 py-2 bg-gray-700 border ${
                errors.phone ? "border-red-500" : "border-gray-600"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
              placeholder="+1 (555) 123-4567"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Company Name field */}
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Desired Company Name *
            </label>
            <input
              id="companyName"
              type="text"
              className={`w-full px-4 py-2 bg-gray-700 border ${
                errors.companyName ? "border-red-500" : "border-gray-600"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
              placeholder="Your Company Ltd"
              {...register("companyName")}
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* Country field */}
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Jurisdiction *
            </label>
            <select
              id="country"
              className={`w-full px-4 py-2 bg-gray-700 border ${
                errors.country ? "border-red-500" : "border-gray-600"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
              {...register("country")}
            >
              <option value="">Select a jurisdiction</option>
              <option value="bvi">British Virgin Islands</option>
              <option value="cayman">Cayman Islands</option>
              <option value="seychelles">Seychelles</option>
              <option value="panama">Panama</option>
              <option value="delaware">Delaware (USA)</option>
              <option value="singapore">Singapore</option>
              <option value="other">Other</option>
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-500">
                {errors.country.message}
              </p>
            )}
          </div>

          {/* Service Type field */}
          <div>
            <label
              htmlFor="serviceType"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Service Type *
            </label>
            <select
              id="serviceType"
              className={`w-full px-4 py-2 bg-gray-700 border ${
                errors.serviceType ? "border-red-500" : "border-gray-600"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
              {...register("serviceType")}
            >
              <option value="">Select a service</option>
              <option value="basic">Basic Formation</option>
              <option value="professional">Professional Formation</option>
              <option value="enterprise">Enterprise Formation</option>
              <option value="banking">Banking Assistance</option>
              <option value="nominee">Nominee Services</option>
              <option value="custom">Custom Solution</option>
            </select>
            {errors.serviceType && (
              <p className="mt-1 text-sm text-red-500">
                {errors.serviceType.message}
              </p>
            )}
          </div>
        </div>

        {/* Message field */}
        <div className="mt-6">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Additional Information
          </label>
          <textarea
            id="message"
            rows={4}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="Please provide any additional details about your requirements..."
            {...register("message")}
          ></textarea>
        </div>

        {/* Submit button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-70"
          >
            {isSubmitting ? "Submitting..." : "Submit Inquiry"}
          </button>
        </div>
      </form>
    </div>
  );
}
