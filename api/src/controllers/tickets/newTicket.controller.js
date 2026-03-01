const Registration = require('../../models/tickets.model');
const sendEmail = require('./sendEmail.controller');

const newTicket = async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['email', 'firstName', 'surname', 'contactNumber', 'conference', 'package'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                missingFields: missingFields
            });
        }

        // Generate ticket ID
        const ticketId = 'TKT' + Math.floor(1000 + Math.random() * 9000);
        
        // Create new registration with URLs
        const registration = new Registration({
            email: req.body.email,
            firstName: req.body.firstName,
            surname: req.body.surname,
            contactNumber: req.body.contactNumber,
            conference: req.body.conference,
            churchOrOrganization: req.body.churchOrOrganization,
            churchInsured: req.body.churchInsured,
            gender: req.body.gender,
            age: req.body.age,
            delegateType: req.body.delegateType,
            emergencyContactName: req.body.emergencyContactName,
            emergencyContactNumber: req.body.emergencyContactNumber,
            package: req.body.package,
            hoodieSize: req.body.hoodieSize,
            passportPhoto: req.body.passportPhotoUrl,
            paymentProof: req.body.paymentProofUrl,
            ticketId: ticketId,
            status: 'pending',
            statusComments: [{
                status: 'pending',
                comment: 'Registration submitted and pending review.',
                createdAt: new Date()
            }]
        });

        // Validate registration data against schema
        const validationError = registration.validateSync();
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(validationError.errors).map(err => err.message)
            });
        }

        // Save registration
        await registration.save();
        
        // Try to send confirmation email (don't fail the whole request if email fails)
        try {
            const emailReq = {
                body: { ticketId }
            };
            
            const emailRes = {
                status: function(statusCode) {
                    console.log(`Email sending status: ${statusCode}`);
                    return this;
                },
                json: function(data) {
                    console.log('Email sending result:', data);
                    return this;
                }
            };
            
            await sendEmail(emailReq, emailRes);
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Log the error but continue with the success response
        }
        
        // Return success response with ticket ID
        console.log('Registration successful:', {
            ticketId: ticketId,
            email: registration.email,
            firstName: registration.firstName,
            surname: registration.surname,
            conference: registration.conference,
            package: registration.package,
            timestamp: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            ticketId: ticketId,
            data: {
                firstName: registration.firstName,
                surname: registration.surname,
                email: registration.email,
                contactNumber: registration.contactNumber,
                conference: registration.conference,
                package: registration.package,
                hoodieSize: registration.hoodieSize
            }
        });
        
    } catch (error) {
        // Handle specific error types
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Duplicate entry detected',
                error: 'A registration with this email already exists'
            });
        }

        // Log the error with stack trace
        console.error('Registration error:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        // Return generic error response
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = newTicket;