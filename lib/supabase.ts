// Only import mysql on server side
const getConnection = typeof window === 'undefined' ? require('./mysql').getConnection : null;

// Define the FormData type for company formation submissions
export type FormSubmission = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  country: string;
  serviceType: string;
  message?: string;
};

// Function to submit form data to MySQL
export async function submitFormData(formData: FormSubmission): Promise<void> {
  if (typeof window !== 'undefined') {
    throw new Error('This function should only be called on the server side');
  }

  try {
    const conn = await getConnection();

    // Insert the form data into the 'inquiries' table
    await conn.execute(`
      INSERT INTO inquiries (
        name, email, phone, company_name, country, service_type, message, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      formData.name,
      formData.email,
      formData.phone,
      formData.companyName,
      formData.country,
      formData.serviceType,
      formData.message || ""
    ]);
  } catch (error) {
    console.error("Error submitting form:", error);
    throw new Error("Failed to submit inquiry");
  }
}
