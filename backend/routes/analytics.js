const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Crop = require('../models/Crop');
const Contract = require('../models/Contract');
const Offer = require('../models/Offer');

router.get('/', auth, async (req, res) => {
    try {
        let stats = {};
        if (req.user.role === 'Seller') {
            const myCrops = await Crop.find({ farmerId: req.user.id });
            const myContracts = await Contract.find({ farmerId: req.user.id });
            const totalEarnings = myContracts.filter(c => c.paymentStatus === 'Paid').reduce((sum, c) => sum + c.agreedPrice, 0);
            
            stats = {
                totalCrops: myCrops.length,
                activeContracts: myContracts.filter(c => c.status === 'Active').length,
                totalEarnings,
                pendingOffers: await Offer.countDocuments({ farmerId: req.user.id, status: 'Pending' })
            };
        } else {
            const myContracts = await Contract.find({ buyerId: req.user.id });
            const totalSpending = myContracts.reduce((sum, c) => sum + c.agreedPrice, 0);
            
            stats = {
                totalOrders: myContracts.length,
                activeContracts: myContracts.filter(c => c.status === 'Active').length,
                totalSpending,
                availableCrops: await Crop.countDocuments({ status: 'Available' })
            };
        }
        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
