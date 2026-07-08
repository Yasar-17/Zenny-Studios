const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function sendEnquiryNotification(enquiry) {
  const { name, email, phone, company, service, message } = enquiry;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #C8A000; border-bottom: 2px solid #C8A000; padding-bottom: 10px;">New Project Inquiry</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr><td style="padding: 8px 0; font-weight: bold; width: 120px; color: #555;">Name</td><td style="padding: 8px 0;">${name}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Phone</td><td style="padding: 8px 0;">${phone}</td></tr>
        ${company ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Company</td><td style="padding: 8px 0;">${company}</td></tr>` : ''}
        ${service ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Service</td><td style="padding: 8px 0;">${service}</td></tr>` : ''}
      </table>
      <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
        <p style="font-weight: bold; color: #555; margin: 0 0 8px 0;">Message</p>
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
    </div>
  `;

  return resend.emails.send({
    from: 'Zenny Studios <onboarding@resend.dev>',
    to: [process.env.EMAIL_TO],
    subject: `New Inquiry from ${name} — ${service || 'General'}`,
    html,
  });
}

module.exports = { sendEnquiryNotification };
