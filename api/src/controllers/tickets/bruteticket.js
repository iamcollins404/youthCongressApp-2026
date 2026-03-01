const Registration = require('../../models/tickets.model');
const sendEmail = require('./sendEmail.controller');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

// Helper function to generate unique ticket ID
const generateUniqueTicketId = async () => {
    let ticketId;
    let exists = true;
    
    while (exists) {
        ticketId = 'TKT' + Math.floor(1000 + Math.random() * 9000);
        const existingTicket = await Registration.findOne({ ticketId });
        exists = !!existingTicket;
    }
    
    return ticketId;
};

const newTicket = async (req, res) => {
    try {
        // Check if this is a bulk upload
        const records = Array.isArray(req.body) ? req.body : [req.body];
        const results = {
            total: records.length,
            successful: 0,
            failed: 0,
            createdRecords: [],
            failedRecords: []
        };

        console.log(`Processing ${records.length} records...`);

        // Process each record
        for (let i = 0; i < records.length; i++) {
            const recordItem = records[i];
            
            // Handle nested record structure - check if data is in record.record or directly in record
            const record = recordItem.record || recordItem;
            
            console.log(`Processing record ${i + 1}/${records.length}:`, { 
                email: record.email, 
                firstName: record.firstName, 
                surname: record.surname 
            });

            try {
                // Generate or use existing ticket ID
                let ticketId = record.ticketId;
                
                // If no ticketId provided, generate a unique one
                if (!ticketId) {
                    ticketId = await generateUniqueTicketId();
                    console.log(`Generated new ticketId: ${ticketId}`);
                } else {
                    // If ticketId is provided, check if it already exists
                    const existingTicket = await Registration.findOne({ ticketId });
                    if (existingTicket) {
                        console.log(`TicketId ${ticketId} already exists, generating new one`);
                        ticketId = await generateUniqueTicketId();
                        console.log(`New unique ticketId: ${ticketId}`);
                    }
                }
                
                // Transform the data to handle MongoDB extended JSON format
                const transformedData = {
                    email: record.email,
                    firstName: record.firstName,
                    surname: record.surname,
                    contactNumber: record.contactNumber || '',
                    conference: record.conference,
                    churchInsured: record.churchInsured || 'true',
                    gender: record.gender,
                    age: record.age || '',
                    package: record.package || 'withPack',
                    hoodieSize: record.hoodieSize,
                    passportPhoto: record.passportPhoto || '',
                    paymentProof: record.paymentProof || '',
                    ticketId: ticketId,
                    status: record.status || 'pending',
                    createdAt: record.createdAt?.$date ? new Date(record.createdAt.$date) : new Date(),
                    statusComments: record.statusComments?.map(comment => ({
                        status: comment.status,
                        comment: comment.comment,
                        createdAt: comment.createdAt?.$date ? new Date(comment.createdAt.$date) : new Date()
                    })) || [{
                        status: record.status || 'pending',
                        comment: 'Registration submitted and pending review.',
                        createdAt: new Date()
                    }]
                };

                console.log(`Creating registration for ticketId: ${ticketId}`);

                // Create and validate registration
                const registration = new Registration(transformedData);
                
                // Validate before saving
                await registration.validate();
                
                // Save registration
                const savedRegistration = await registration.save();
                
                console.log(`Successfully saved registration: ${savedRegistration.ticketId}`);
                
                results.successful++;
                results.createdRecords.push({
                    ticketId: savedRegistration.ticketId,
                    email: savedRegistration.email,
                    firstName: savedRegistration.firstName,
                    surname: savedRegistration.surname,
                    status: savedRegistration.status
                });
                
            } catch (error) {
                console.error(`Error processing record ${i + 1}:`, {
                    error: error.message,
                    record: { 
                        email: record.email, 
                        firstName: record.firstName, 
                        surname: record.surname,
                        ticketId: record.ticketId 
                    }
                });

                results.failed++;
                
                // Handle specific error types
                let errorMessage = error.message;
                if (error.name === 'ValidationError') {
                    errorMessage = `Validation Error: ${Object.values(error.errors).map(err => err.message).join(', ')}`;
                } else if (error.code === 11000) {
                    errorMessage = `Duplicate Entry: ${error.message}`;
                } else if (error.name === 'CastError') {
                    errorMessage = `Data Type Error: ${error.message}`;
                }

                results.failedRecords.push({
                    recordIndex: i + 1,
                    record: {
                        email: record.email,
                        firstName: record.firstName,
                        surname: record.surname,
                        ticketId: record.ticketId
                    },
                    error: errorMessage,
                    errorType: error.name,
                    originalError: recordItem.error || null // Include original error if present
                });
            }
        }

        // Save failed records to file if any
        if (results.failedRecords.length > 0) {
            const failedFilePath = path.join(__dirname, 'failed.json');
            await fs.writeFile(failedFilePath, JSON.stringify(results.failedRecords, null, 2));
            console.log(`Saved ${results.failedRecords.length} failed records to failed.json`);
        }

        console.log('Bulk upload completed:', {
            total: results.total,
            successful: results.successful,
            failed: results.failed
        });

        // Return summary response
        res.status(200).json({
            success: true,
            message: `Bulk upload completed. ${results.successful} successful, ${results.failed} failed.`,
            results: {
                total: results.total,
                successful: results.successful,
                failed: results.failed,
                createdRecords: results.createdRecords,
                failedRecords: results.failedRecords.length > 10 ? 
                    results.failedRecords.slice(0, 10).concat([{ message: `... and ${results.failedRecords.length - 10} more failed records` }]) : 
                    results.failedRecords,
                failedRecordsPath: results.failedRecords.length > 0 ? 'failed.json' : null
            }
        });
        
    } catch (error) {
        // Log the error with stack trace
        console.error('Bulk upload error:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        // Return detailed error response
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred during bulk upload',
            error: {
                message: error.message,
                type: error.name,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });
    }
};

module.exports = newTicket;