const Registration = require('../../models/tickets.model');

const updateTicketImage = async (req, res) => {
    try {
        const updates = Array.isArray(req.body) ? req.body : [req.body];
        
        // Filter out records with null mediaLink
        const validUpdates = updates.filter(record => record.ticketId && record.mediaLink !== null);
        
        if (validUpdates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid records to process (all records have null mediaLink)'
            });
        }

        const results = {
            total: updates.length,
            skipped: updates.length - validUpdates.length,
            successful: 0,
            failed: 0,
            failedRecords: []
        };

        // Process each update
        for (const update of validUpdates) {
            try {
                const updatedRegistration = await Registration.findOneAndUpdate(
                    { ticketId: update.ticketId },
                    { 
                        $set: { 
                            passportPhoto: update.mediaLink,
                            contactNumber: update.phoneNumber || '' // Update phone number if provided
                        } 
                    },
                    { new: true, runValidators: true }
                );

                if (updatedRegistration) {
                    results.successful++;
                } else {
                    results.failed++;
                    results.failedRecords.push({
                        ticketId: update.ticketId,
                        error: 'Ticket not found'
                    });
                }
            } catch (error) {
                results.failed++;
                results.failedRecords.push({
                    ticketId: update.ticketId,
                    error: error.message
                });
            }
        }

        // Return results
        res.status(200).json({
            success: true,
            message: `Processed ${results.total} records. ${results.skipped} skipped (null mediaLink), ${results.successful} successful, ${results.failed} failed.`,
            results: results
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing bulk update',
            error: error.message
        });
    }
};

module.exports = updateTicketImage; 