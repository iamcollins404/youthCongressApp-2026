const Tickets = require('../../models/tickets.model');

const allTickets = async (req, res) => {
    const allTickets = await Tickets.find();
    res.json(allTickets);
};

module.exports = allTickets;
