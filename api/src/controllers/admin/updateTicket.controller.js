const Registration = require('../../models/tickets.model');
const sendApprovalEmail = require('../tickets/sendApprovalEmail.controller');
const sendDeclinedEmail = require('../tickets/sendDeclinedEmail.controller');

const updateTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        
        if (!ticketId) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID is required'
            });
        }
        
        // Validate request body
        const { status, comment } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }
        
        if (!['pending', 'approved', 'declined'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be one of: pending, approved, declined'
            });
        }
        
        if (!comment) {
            return res.status(400).json({
                success: false,
                message: 'Comment is required for status change'
            });
        }
        
        // Find existing registration
        const existingRegistration = await Registration.findOne({ ticketId });
        
        if (!existingRegistration) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }
        
        // Create new status comment
        const newStatusComment = {
            status,
            comment,
            createdAt: new Date()
        };
        
        // Update registration with new status and add comment to history
        const updatedRegistration = await Registration.findOneAndUpdate(
            { ticketId },
            {
                $set: { status },
                $push: { statusComments: newStatusComment }
            },
            { new: true, runValidators: true }
        );

        // Send approval email when status changes to approved (don't fail the request if email fails)
        if (status === 'approved') {
            try {
                await sendApprovalEmail(updatedRegistration);
            } catch (emailError) {
                console.error('Failed to send approval email:', emailError);
            }
        }

        // Send declined email when status changes to declined (don't fail the request if email fails)
        if (status === 'declined') {
            try {
                await sendDeclinedEmail(updatedRegistration, comment);
            } catch (emailError) {
                console.error('Failed to send declined email:', emailError);
            }
        }
        
        // Return success response
        res.status(200).json({
            success: true,
            message: `Ticket status updated to ${status}`,
            data: {
                ticketId: updatedRegistration.ticketId,
                firstName: updatedRegistration.firstName,
                surname: updatedRegistration.surname,
                status: updatedRegistration.status,
                comments: updatedRegistration.statusComments
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating ticket status',
            error: error.message
        });
    }
};

module.exports = updateTicket;
