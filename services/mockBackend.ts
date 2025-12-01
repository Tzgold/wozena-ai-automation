
// This service simulates a real backend API.
// In a real production app, these functions would be `fetch` calls to your Node/Python server.

export interface BookingRequest {
  type: string;
  date: number;
  time: string;
  name: string;
  email: string;
  company: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const STORAGE_KEY = 'wozena_bookings_db';
const CONTACT_STORAGE_KEY = 'wozena_contacts_db';

export const mockBackendService = {
  /**
   * Simulates the POST /api/book endpoint.
   * - Validates input
   * - Saves to "Database" (LocalStorage)
   * - Triggers "Email Sending" (Console Log)
   */
  submitBooking: async (data: BookingRequest): Promise<{ success: boolean; id: string }> => {
    console.group('🌐 [MOCK BACKEND] POST /api/v1/book');
    console.log('Payload received:', data);

    // 1. Simulate Network Latency (1.5s - 3s)
    const delay = Math.random() * 1500 + 1500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // 2. Backend Validation
    if (!data.email.includes('@') || !data.email.includes('.')) {
      console.error('❌ Validation Error: Invalid Email Format');
      console.groupEnd();
      throw new Error('Please enter a valid email address.');
    }
    if (data.name.length < 2) {
      console.error('❌ Validation Error: Name too short');
      console.groupEnd();
      throw new Error('Name must be at least 2 characters.');
    }

    // 3. "Database" Insertion
    const bookingId = 'bk_' + Math.random().toString(36).substr(2, 9);
    const newBooking = {
      id: bookingId,
      ...data,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };

    const existingData = localStorage.getItem(STORAGE_KEY);
    const db = existingData ? JSON.parse(existingData) : [];
    db.push(newBooking);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    
    console.log('✅ [Database] Record inserted:', newBooking);

    // 4. "Email Service" Trigger
    console.log('📧 [Email Service] Sending confirmation to:', data.email);
    console.log(`
      ----------------------------------------------------
      FROM: no-reply@wozena.ai
      TO: ${data.email}
      SUBJECT: Booking Confirmed: ${data.type}

      Hi ${data.name},

      Your appointment for ${data.type} is confirmed.
      
      Date: October ${data.date}
      Time: ${data.time}
      
      A calendar invite has been attached.
      
      Regards,
      The Wozena Team
      ----------------------------------------------------
    `);

    // 5. Admin Notification
    console.log('🔔 [Slack Bot] New Lead Alert sent to #sales channel');

    console.groupEnd();

    return { success: true, id: bookingId };
  },

  /**
   * Simulates POST /api/contact
   */
  submitContactForm: async (data: ContactRequest): Promise<{ success: boolean; id: string }> => {
    console.group('🌐 [MOCK BACKEND] POST /api/v1/contact');
    console.log('Payload received:', data);

    // 1. Latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 2. Validation
    if (!data.email.includes('@')) {
       console.error('❌ Validation Error: Invalid Email');
       console.groupEnd();
       throw new Error('Invalid email address.');
    }
    if (data.message.length < 10) {
       console.error('❌ Validation Error: Message too short');
       console.groupEnd();
       throw new Error('Message is too short. Please provide more details.');
    }

    // 3. DB Insert
    const contactId = 'ct_' + Math.random().toString(36).substr(2, 9);
    const newContact = {
        id: contactId,
        ...data,
        createdAt: new Date().toISOString(),
        status: 'received'
    };
    
    const existingData = localStorage.getItem(CONTACT_STORAGE_KEY);
    const db = existingData ? JSON.parse(existingData) : [];
    db.push(newContact);
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(db));

    console.log('✅ [Database] Message stored:', newContact);
    console.log('🔔 [Slack Bot] New Contact Inquiry from ' + data.email);
    console.groupEnd();

    return { success: true, id: contactId };
  }
};
