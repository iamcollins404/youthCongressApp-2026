const { Resend } = require('resend');

const PKG_LABELS = {
  basic: 'Basic — No Pack (R450)',
  basicPack: 'Basic Pack — Jacket (R750)',
  halfPack: 'Half Pack — Jacket & Bag (R900)',
  fullPack: 'Full Pack — Jacket, Bag, Cup & Socks (R1 200)',
  withPack: 'Including Congress Pack (R750)',
  withoutPack: 'Without Congress Pack (R450)',
};

const CONF_LABELS = {
  ncsa: 'Northern Conference of South Africa (NCSA)',
  'cape-eastern': 'Cape Conference - Eastern Region',
  'cape-northern': 'Cape Conference - Northern Region',
  'cape-western': 'Cape Conference - Western Region',
  'cc-western': 'Cape Conference - Western Region',
  'cc-northern': 'Cape Conference - Northern Region',
  'cc-eastern': 'Cape Conference - Eastern Region',
  cape: 'The Cape Conference',
};

/**
 * Sends an approval email when a ticket is approved.
 * @param {Object} registration - Mongoose registration document
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
const sendApprovalEmail = async (registration) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set');
      return { success: false, error: 'Email service is not configured' };
    }

    const resend = new Resend(apiKey);
    const conferenceName = CONF_LABELS[registration.conference] || registration.conference;
    const packageName = PKG_LABELS[registration.package] || registration.package;
    const ticketUrl = `${process.env.FRONTEND_URL || 'https://wnryouthcongress.co.za'}/ticket/${registration.ticketId}`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Ticket is Approved!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.65; color: #2d3748; margin: 0; padding: 0; background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); }
    .container { max-width: 560px; margin: 0 auto; padding: 24px 16px; }
    .header { text-align: center; padding: 36px 24px; background: linear-gradient(135deg, #0c0f2e 0%, #1e1a5e 50%, #141842 100%); border-radius: 12px 12px 0 0; }
    .header h1 { color: white; font-size: 26px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
    .header .tagline { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 12px; letter-spacing: 0.5px; }
    .content { padding: 32px 28px; background: white; border-radius: 0 0 12px 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .congrats { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 8px; margin: 0 0 24px 0; }
    .congrats h2 { color: #047857; font-size: 20px; margin: 0 0 8px 0; font-weight: 700; }
    .congrats p { color: #065f46; margin: 0; font-size: 15px; line-height: 1.5; }
    .greeting { font-size: 16px; color: #2d3748; margin: 0 0 16px 0; }
    .intro { font-size: 15px; color: #4a5568; margin: 0 0 24px 0; }
    .see-you { font-size: 15px; color: #1e293b; margin: 20px 0; padding: 16px 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-style: italic; }
    .details { background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e2e8f0; }
    .details h3 { color: #0c0f2e; font-size: 14px; font-weight: 600; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .details-table { width: 100%; border-collapse: collapse; }
    .details-table td { padding: 10px 0; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .details-table tr:last-child td { border-bottom: none; }
    .details-table .label { color: #64748b; font-size: 13px; width: 120px; padding-right: 16px; }
    .details-table .value { font-size: 14px; color: #1e293b; font-weight: 500; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #d1fae5; color: #047857; }
    .ticket-box { text-align: center; margin: 28px 0; padding: 28px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0; }
    .ticket-box h3 { color: #0c0f2e; font-size: 18px; margin: 0 0 8px 0; }
    .ticket-box .sub { color: #64748b; font-size: 14px; margin-bottom: 20px; }
    .ticket-button { display: inline-block; background: linear-gradient(135deg, #00c8ff 0%, #0099cc 100%); color: white !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; text-align: center; text-decoration: none; box-shadow: 0 2px 8px rgba(0,200,255,0.3); }
    .ticket-button:hover { opacity: 0.95; }
    .ticket-hint { font-size: 13px; color: #64748b; margin-top: 16px; }
    .footer { text-align: center; padding: 24px 16px; font-size: 12px; color: #94a3b8; }
    .footer a { color: #00c8ff; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Senior Youth Congress 2026</h1>
      <p class="tagline">EAST LONDON INTERNATIONAL CONVENTION CENTRE</p>
    </div>
    <div class="content">
      <div class="congrats">
        <h2>Congratulations!</h2>
        <p>Your registration has been approved. You're officially in — we can't wait to see you there!</p>
      </div>
      <p class="greeting">Dear ${registration.firstName} ${registration.surname},</p>
      <p class="intro">Great news! Your ticket for the Senior Youth Congress 2026 is now official. You're all set to join us for an unforgettable experience.</p>
      <div class="see-you">
        <strong>We can't wait to see you!</strong> — Get ready for inspiring sessions, meaningful connections, and lasting memories. See you soon!
      </div>
      <div class="ticket-box">
        <h3>Your Official Ticket</h3>
        <p class="sub">View and download your ticket for the event</p>
        <a href="${ticketUrl}" class="ticket-button">View My Ticket</a>
        <p class="ticket-hint">Save this email — your ticket link: <a href="${ticketUrl}">wnryouthcongress.co.za/ticket/${registration.ticketId}</a></p>
      </div>
      <div class="details">
        <h3>Attendee Information</h3>
        <table class="details-table" cellpadding="0" cellspacing="0">
          <tr><td class="label">Full Name</td><td class="value">${registration.firstName} ${registration.surname}</td></tr>
          <tr><td class="label">Email</td><td class="value">${registration.email}</td></tr>
          <tr><td class="label">Contact</td><td class="value">${registration.contactNumber}</td></tr>
          <tr><td class="label">Conference</td><td class="value">${conferenceName}</td></tr>
        </table>
      </div>
      <div class="details">
        <h3>Ticket Details</h3>
        <table class="details-table" cellpadding="0" cellspacing="0">
          <tr><td class="label">Ticket ID</td><td class="value">${registration.ticketId}</td></tr>
          <tr><td class="label">Package</td><td class="value">${packageName}</td></tr>
          <tr><td class="label">Status</td><td class="value"><span class="status-badge">Approved</span></td></tr>
        </table>
      </div>
      <p style="font-size: 14px; color: #64748b; margin: 24px 0 0 0;">Remember to bring a physical or digital copy of your ticket to the event registration desk.</p>
      <p style="font-size: 15px; margin: 20px 0 0 0; color: #1e293b;">Best regards,<br><strong>Senior Youth Congress Team</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 Northern Conference of South Africa & The Cape Conference</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

    const fromAddress = process.env.EMAIL_FROM || 'SYC Congress <onboarding@resend.dev>';
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: registration.email.trim().toLowerCase(),
      subject: 'Congratulations! Your ticket has been approved — Senior Youth Congress 2026',
      html,
    });

    if (error) {
      console.error('Approval email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Approval email error:', err);
    return { success: false, error: err.message };
  }
};

module.exports = sendApprovalEmail;
