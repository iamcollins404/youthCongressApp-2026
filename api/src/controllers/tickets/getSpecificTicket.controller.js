const Registration = require('../../models/tickets.model');
const path = require('path');
const fs = require('fs');

const specificTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        
        if (!ticketId) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID is required'
            });
        }
        
        // Find the registration by ticketId
        const registration = await Registration.findOne({ ticketId });
        
        // Check if registration exists
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }
        
        res.status(200).json(registration);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving ticket',
            error: error.message
        });
    }
};

module.exports = specificTicket;
