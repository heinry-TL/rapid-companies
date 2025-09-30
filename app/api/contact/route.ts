import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { submitFormData } from '@/lib/supabase';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  companyName: z.string().optional(),
  jurisdiction: z.string().min(1, 'Please select a jurisdiction'),
  serviceType: z.string().min(1, 'Please select a service type'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;

    // Validate the request body
    const validatedData = contactFormSchema.parse(body);

    // Transform to match database structure
    const formData = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      companyName: validatedData.companyName || '',
      country: validatedData.jurisdiction,
      serviceType: validatedData.serviceType,
      message: validatedData.message,
    };

    // Submit to database
    await submitFormData(formData);

    return NextResponse.json(
      { message: 'Contact form submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form submission error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}