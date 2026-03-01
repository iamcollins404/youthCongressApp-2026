const Registration = require('../../models/tickets.model');

const getDashboardStats = async (req, res) => {
    try {
        const tickets = await Registration.find().lean();

        const ticketStats = {
            approved: tickets.filter(t => t.status === 'approved').length,
            pending: tickets.filter(t => t.status === 'pending').length,
            rejected: tickets.filter(t => t.status === 'declined').length,
            total: tickets.length,
        };

        const packageKeys = ['basic', 'basicPack', 'halfPack', 'fullPack', 'withPack', 'withoutPack'];
        const congressPacks = {};
        packageKeys.forEach(key => {
            congressPacks[key] = tickets.filter(t => t.package === key).length;
        });
        congressPacks.total = tickets.filter(t =>
            ['basicPack', 'halfPack', 'fullPack', 'withPack'].includes(t.package)
        ).length;

        const sizeKeys = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
        const hoodieSizes = {};
        sizeKeys.forEach(size => {
            hoodieSizes[size] = tickets.filter(t => t.hoodieSize === size).length;
        });
        hoodieSizes.total = sizeKeys.reduce((sum, s) => sum + (hoodieSizes[s] || 0), 0);

        res.status(200).json({
            success: true,
            data: { ticketStats, congressPacks, hoodieSizes },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message,
        });
    }
};

module.exports = getDashboardStats;
