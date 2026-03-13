const { Resend } = require('resend');

/**
 * Sends a declined/rejection email when a ticket is declined.
 * @param {Object} registration - Mongoose registration document
 * @param {string} comment - The reason/comment for the decline
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const sendDeclinedEmail = async (registration, comment) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set');
      return { success: false, error: 'Email service is not configured' };
    }

    const resend = new Resend(apiKey);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Update — Senior Youth Congress 2026</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.65; color: #2d3748; margin: 0; padding: 0; background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); }
    .container { max-width: 560px; margin: 0 auto; padding: 24px 16px; }
    .header { text-align: center; padding: 36px 24px; background: linear-gradient(135deg, #0c0f2e 0%, #1e1a5e 50%, #141842 100%); border-radius: 12px 12px 0 0; }
    .header h1 { color: white; font-size: 26px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
    .header .tagline { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 12px; letter-spacing: 0.5px; }
    .content { padding: 32px 28px; background: white; border-radius: 0 0 12px 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .sorry-box { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 8px; margin: 0 0 24px 0; }
    .sorry-box h2 { color: #b91c1c; font-size: 20px; margin: 0 0 8px 0; font-weight: 700; }
    .sorry-box p { color: #991b1b; margin: 0; font-size: 15px; line-height: 1.5; }
    .comment-box { background: #f8fafc; padding: 16px 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; }
    .comment-box h3 { color: #0c0f2e; font-size: 13px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .comment-box p { color: #475569; margin: 0; font-size: 15px; line-height: 1.5; }
    .greeting { font-size: 16px; color: #2d3748; margin: 0 0 16px 0; }
    .intro { font-size: 15px; color: #4a5568; margin: 0 0 24px 0; }
    .help-box { background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 24px 0; border: 1px solid #bae6fd; }
    .help-box h3 { color: #0c0f2e; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; }
    .help-box p { color: #475569; margin: 0 0 12px 0; font-size: 14px; }
    .help-box .contact { margin: 12px 0; padding: 12px 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; }
    .help-box .contact-name { font-weight: 600; color: #0c0f2e; font-size: 15px; margin-bottom: 4px; }
    .help-box a { color: #00c8ff; text-decoration: none; }
    .help-box a:hover { text-decoration: underline; }
    .footer { text-align: center; padding: 24px 16px; font-size: 12px; color: #94a3b8; }
    .footer a { color: #00c8ff; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Senior Youth Congress 2026</h1>
      <p class="tagline">White City Multi Purpose Center — Saldanha Bay</p>
    </div>
    <div class="content">
      <div class="sorry-box">
        <h2>We're sorry</h2>
        <p>Unfortunately, we are unable to approve your registration for the Senior Youth Congress 2026 at this time.</p>
      </div>
      <p class="greeting">Dear ${registration.firstName} ${registration.surname},</p>
      <p class="intro">Thank you for your interest in the Senior Youth Congress 2026. We regret to inform you that your registration could not be approved.</p>
      <div class="comment-box">
        <h3>Reason</h3>
        <p>${escapeHtml(comment) || 'Please contact us for more information.'}</p>
      </div>
      <p style="font-size: 15px; color: #4a5568; margin: 0 0 24px 0;">If you believe this is an error or would like to discuss your registration, please reach out to our team using the contact details below.</p>
      <div class="help-box">
        <h3>Need help? Contact our team</h3>
        <div class="contact">
          <div class="contact-name">Pastor Brinton Laing</div>
          <div><a href="tel:+27766528105">+27 76 652 8105</a></div>
          <div><a href="mailto:youthwr@cc.adventist.org">youthwr@cc.adventist.org</a></div>
        </div>
        <div class="contact">
          <div class="contact-name">Gloria Yako</div>
          <div><a href="tel:+27795756977">+27 79 575 6977</a></div>
          <div><a href="mailto:youthwr@cc.adventist.org">youthwr@cc.adventist.org</a></div>
        </div>
      </div>
      <p style="font-size: 14px; color: #64748b; margin: 24px 0 0 0;">We hope to see you at a future event.</p>
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
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: registration.email.trim().toLowerCase(),
      subject: 'Registration Update — Senior Youth Congress 2026',
      html,
    });

    if (error) {
      console.error('Declined email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Declined email error:', err);
    return { success: false, error: err.message };
  }
};

module.exports = sendDeclinedEmail;
