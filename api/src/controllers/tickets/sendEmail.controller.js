const { EmailClient } = require("@azure/communication-email");
const Registration = require('../../models/tickets.model');

const sendEmail = async (req, res) => {
  try {
    const { ticketId } = req.body;

    // Validate ticketId is present
    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID is required'
      });
    }

    // Find registration in database using the ticketId
    const registration = await Registration.findOne({ ticketId });
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found with the provided ticket ID'
      });
    }

    // Format conference name based on conference code
    let conferenceName = registration.conference;
    switch(registration.conference) {
      case 'ncsa':
        conferenceName = 'Northern Conference of South Africa (NCSA)';
        break;
      case 'cape-eastern':
        conferenceName = 'Cape Conference - Eastern Region';
        break;
      case 'cape-northern':
        conferenceName = 'Cape Conference - Northern Region';
        break;
      case 'cape-western':
        conferenceName = 'Cape Conference - Western Region';
        break;
    }
    
    // Format package name
    const packageName = registration.package === 'withPack' 
      ? 'Including Congress Pack (R750)' 
      : 'Without Congress Pack (R450)';

    // Generate ticket URL (frontend ticket view URL)
    const ticketUrl = `${process.env.FRONTEND_URL || 'https://www.ncsaccyouthcongress25.org'}/ticket/${ticketId}`;

    // Configure Azure Communication Services
    const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING || "endpoint=https://emails-ziyfc.unitedstates.communication.azure.com/;accesskey=FOna302KeKEGEPYdJ3y5g6dDXsKWvWvtnFbfr4ymauM6NO0IC3laJQQJ99BBACULyCplu5NSAAAAAZCS0nad";
    const client = new EmailClient(connectionString);

    // Prepare email data
    const emailData = {
      senderAddress: process.env.EMAIL_SENDER || "DoNotReply@caed21c2-d020-4bf1-aa82-4d31503130e3.azurecomm.net",
      content: {
        subject: "Senior Youth Congress 2025 Registration Confirmation",
        plainText: `Thank you for registering for the Senior Youth Congress 2025, ${registration.firstName}!`,
        html: `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registration Confirmation</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 40px 0;
              background: #1a237e;
            }
            .header h1 {
              color: white;
              font-size: 28px;
              margin: 0;
            }
            .content {
              padding: 30px 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              margin: 20px 0;
            }
            .details {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 1px solid #e9ecef;
            }
            .details-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e9ecef;
            }
            .details-row:last-child {
              border-bottom: none;
            }
            .details h3 {
              color: #1a237e;
              margin-top: 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 14px;
              color: #666;
            }
            a {
              color: #1a237e !important;
              text-decoration: none;
            }
            a:hover {
              color: #283593 !important;
            }
            .ticket-button {
              display: inline-block;
              background: #1a237e;
              color: white !important;
              padding: 16px 32px;
              border-radius: 4px;
              font-weight: 600;
              text-align: center;
              margin: 24px 0;
              width: 100%;
              max-width: 300px;
              text-decoration: none;
              transition: all 0.3s ease;
            }
            .ticket-button:hover {
              background: #283593;
              color: white !important;
            }
            .ticket-container {
              text-align: center;
              margin: 32px 0;
              padding: 24px;
              background: #f8f9fa;
              border-radius: 8px;
              border: 1px solid #e9ecef;
            }
            .label {
              color: #666;
              font-size: 13px;
              margin-bottom: 3px;
            }
            .value {
              font-size: 15px;
              color: #333;
            }
            .status-badge {
              display: inline-block;
              background-color: #1a237e;
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 14px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Senior Youth Congress 2025</h1>
              <p style="color: white; opacity: 0.8; margin-top: 8px;">13 - 16 JUNE 2025 • EAST LONDON INTERNATIONAL CONVENTION CENTRE</p>
            </div>
            
            <div class="content">
              <p>Dear ${registration.firstName} ${registration.surname},</p>
              
              <p>Thank you for registering for the Senior Youth Congress 2025! Your registration has been submitted and is being processed.</p>

              <div class="ticket-container">
                <h3 style="color: #1a237e; margin-bottom: 16px;">Your Ticket is Ready!</h3>
                <p style="margin-bottom: 24px;">Click the button below to view your ticket details:</p>
                <a href="${ticketUrl}" class="ticket-button">
                  View My Ticket
                </a>
                <p style="font-size: 14px; color: #666; margin-top: 16px;">
                  Save this email to access your ticket at any time
                </p>
              </div>

              <div class="details">
                <h3>Attendee Information</h3>
                
                <div class="details-row">
                  <span class="label">Full Name:</span>
                  <span class="value">${registration.firstName} ${registration.surname}</span>
                </div>
                
                <div class="details-row">
                  <span class="label">Email:</span>
                  <span class="value">${registration.email}</span>
                </div>
                
                <div class="details-row">
                  <span class="label">Contact Number:</span>
                  <span class="value">${registration.contactNumber}</span>
                </div>

                <div class="details-row">
                  <span class="label">Conference:</span>
                  <span class="value">${conferenceName}</span>
                </div>
              </div>

              <div class="details">
                <h3>Ticket Details</h3>
                
                <div class="details-row">
                  <span class="label">Ticket ID:</span>
                  <span class="value">${registration.ticketId}</span>
                </div>
                
                <div class="details-row">
                  <span class="label">Package Type:</span>
                  <span class="value">${packageName}</span>
                </div>
                
                <div class="details-row">
                  <span class="label">Registration Date:</span>
                  <span class="value">${new Date(registration.createdAt).toLocaleDateString()}</span>
                </div>

                <div class="details-row">
                  <span class="label">Status:</span>
                  <span class="status-badge">${registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}</span>
                </div>
              </div>

              <p>We're excited to have you join us for this transformative event! Please download and save your ticket as PDF for easier access during the event.</p>

              <p>Remember to bring a physical or digital copy of this ticket to the event registration desk.</p>

              <p>Best regards,<br>Senior Youth Congress Team</p>
            </div>

            <div class="footer">
              <p>© 2025 Northern Conference of South Africa & The Cape Conference</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>`
      },
      recipients: {
        to: [
          {
            address: registration.email.trim().toLowerCase()
          }
        ]
      }
    };

    // Send email
    const poller = await client.beginSend(emailData);
    const result = await poller.pollUntilDone();

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Confirmation email sent successfully',
      data: {
        ticketId: registration.ticketId,
        email: registration.email
      }
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send confirmation email',
      error: error.message
    });
  }
};

module.exports = sendEmail;

