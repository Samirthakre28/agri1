const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Contract = require('../models/Contract');

// @route   GET api/contracts/my
// @desc    Get contracts for logged-in user
router.get('/my', auth, async (req, res) => {
    try {
        let contracts;
        if (req.user.role === 'Seller') {
            contracts = await Contract.find({ farmerId: req.user.id }).sort({ dateCreated: -1 });
        } else {
            contracts = await Contract.find({ buyerId: req.user.id }).sort({ dateCreated: -1 });
        }
        res.json(contracts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/contracts/:id/payment
// @desc    Update payment status (Buyer only)
router.put('/:id/payment', auth, async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id);
        if (!contract) return res.status(404).json({ message: 'Contract not found.' });

        if (contract.buyerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the associated buyer can mark as paid.' });
        }

        contract.paymentStatus = 'Paid';
        await contract.save();
        res.json({ success: true, message: 'Payment marked as Paid.', contract });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
