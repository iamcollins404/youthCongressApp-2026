const Registration = require("../../models/tickets.model");
const sendEmail = require("../tickets/sendEmail.controller");

// Helper function to generate unique ticket ID
const generateUniqueTicketId = async () => {
  let ticketId;
  let exists = true;

  while (exists) {
    ticketId = "TKT" + Math.floor(1000 + Math.random() * 9000);
    const existingTicket = await Registration.findOne({ ticketId });
    exists = !!existingTicket;
  }

  return ticketId;
};

const createTicket = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = [
      "email",
      "firstName",
      "surname",
      "contactNumber",
      "conference",
      "gender",
      "package",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields: missingFields,
      });
    }

    // Check if email already exists
    const existingRegistration = await Registration.findOne({
      email: req.body.email,
    });
    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: "A ticket with this email already exists",
        existingTicketId: existingRegistration.ticketId,
      });
    }

    // Check if file URLs were provided
    if (!req.body.passportPhoto || !req.body.paymentProof) {
      return res.status(400).json({
        success: false,
        message: "Both passport photo and payment proof URLs are required",
      });
    }

    // Generate unique ticket ID
    const ticketId = await generateUniqueTicketId();

    // Get current time in Harare timezone
    const getCurrentHarareTime = () => {
      return new Date().toLocaleString("en-US", { timeZone: "Africa/Harare" });
    };

    // Create new registration
    const registrationData = {
      email: req.body.email,
      firstName: req.body.firstName,
      surname: req.body.surname,
      contactNumber: req.body.contactNumber,
      conference: req.body.conference,
      churchInsured: req.body.churchInsured || "true",
      gender: req.body.gender,
      age: req.body.age || "",
      package: req.body.package,
      hoodieSize: req.body.hoodieSize || "",
      passportPhoto: req.body.passportPhoto,
      paymentProof: req.body.paymentProof,
      ticketId: ticketId,
      status: req.body.status || "pending",
      createdAt: getCurrentHarareTime(),
      statusComments: [
        {
          status: req.body.status || "pending",
          comment: req.body.statusComment || "Ticket created by admin.",
          createdAt: getCurrentHarareTime(),
        },
      ],
    };

    const packsNeedingSize = ["basicPack", "halfPack", "fullPack", "withPack"];
    if (packsNeedingSize.includes(registrationData.package) && !registrationData.hoodieSize) {
      return res.status(400).json({
        success: false,
        message: "Hoodie size is required for this package",
      });
    }

    const registration = new Registration(registrationData);

    // Validate registration data against schema
    const validationError = registration.validateSync();
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(validationError.errors).map((err) => err.message),
      });
    }

    // Save registration
    const savedRegistration = await registration.save();

    // Try to send confirmation email (don't fail if email fails)
    try {
      const emailReq = {
        body: { ticketId },
      };

      const emailRes = {
        status: function (statusCode) {
          console.log(`Email sending status: ${statusCode}`);
          return this;
        },
        json: function (data) {
          console.log("Email sending result:", data);
          return this;
        },
      };

      await sendEmail(emailReq, emailRes);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Log the error but continue with the success response
    }

    // Log successful creation
    console.log("Admin ticket creation successful:", {
      ticketId: ticketId,
      email: savedRegistration.email,
      firstName: savedRegistration.firstName,
      surname: savedRegistration.surname,
      conference: savedRegistration.conference,
      package: savedRegistration.package,
      status: savedRegistration.status,
      createdBy: "admin",
      timestamp: new Date().toISOString(),
    });

    // Return success response with ticket data
    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticketId: ticketId,
      data: {
        ticketId: savedRegistration.ticketId,
        firstName: savedRegistration.firstName,
        surname: savedRegistration.surname,
        email: savedRegistration.email,
        contactNumber: savedRegistration.contactNumber,
        conference: savedRegistration.conference,
        package: savedRegistration.package,
        hoodieSize: savedRegistration.hoodieSize,
        status: savedRegistration.status,
        gender: savedRegistration.gender,
        age: savedRegistration.age,
        passportPhoto: savedRegistration.passportPhoto,
        paymentProof: savedRegistration.paymentProof,
        createdAt: savedRegistration.createdAt,
        statusComments: savedRegistration.statusComments,
      },
    });
  } catch (error) {
    // Handle specific error types
    if (error.name === "MongoError" && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate entry detected",
        error: "A registration with this information already exists",
      });
    }

    // Log the error with stack trace
    console.error("Admin ticket creation error:", {
      message: error.message,
      stack: error.stack,
      requestData: req.body,
      timestamp: new Date().toISOString(),
    });

    // Return generic error response
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while creating the ticket",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

module.exports = createTicket;
