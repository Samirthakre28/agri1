const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Offer = require('../models/Offer');
const Crop = require('../models/Crop');
const Contract = require('../models/Contract');

// @route   POST api/offers
// @desc    Send an offer on a crop
router.post('/', auth, async (req, res) => {
    const { cropId, offeredPrice } = req.body;

    if (req.user.role !== 'Buyer') {
        return res.status(403).json({ message: 'Only buyers can send offers.' });
    }

    try {
        const crop = await Crop.findById(cropId);
        if (!crop) {
            return res.status(404).json({ message: 'Crop not found.' });
        }

        // Prevent duplicate offers
        const existingOffer = await Offer.findOne({ cropId, buyerId: req.user.id });
        if (existingOffer) {
            return res.status(400).json({ message: 'You have already sent an offer for this crop.' });
        }

        const newOffer = new Offer({
            cropId,
            buyerId: req.user.id,
            buyerName: req.user.name,
            farmerId: crop.farmerId,
            offeredPrice
        });

        await newOffer.save();
        res.json({ success: true, message: 'Offer sent successfully!', offer: newOffer });
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Duplicate offer detected.' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/offers/my
// @desc    Get offers for logged-in user (as buyer or farmer)
router.get('/my', auth, async (req, res) => {
    try {
        let offers;
        if (req.user.role === 'Seller') {
            offers = await Offer.find({ farmerId: req.user.id }).populate('cropId').sort({ dateOffered: -1 });
        } else {
            offers = await Offer.find({ buyerId: req.user.id }).populate('cropId').sort({ dateOffered: -1 });
        }
        res.json(offers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/offers/:id/status
// @desc    Accept or Reject an offer
router.put('/:id/status', auth, async (req, res) => {
    const { status } = req.body; // 'Accepted' or 'Rejected'

    if (req.user.role !== 'Seller') {
        return res.status(403).json({ message: 'Only farmers can accept/reject offers.' });
    }

    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: 'Offer not found.' });

        if (offer.farmerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized.' });
        }

        offer.status = status;
        await offer.save();

        if (status === 'Accepted') {
            const crop = await Crop.findById(offer.cropId);
            crop.status = 'Accepted';
            await crop.save();

            // Create Contract
            const newContract = new Contract({
                cropId: offer.cropId,
                offerId: offer._id,
                buyerId: offer.buyerId,
                farmerId: offer.farmerId,
                cropName: crop.cropName,
                buyerName: offer.buyerName,
                farmerName: req.user.name,
                agreedPrice: offer.offeredPrice,
                quantity: crop.quantity
            });
            await newContract.save();
        }

        res.json({ success: true, message: `Offer ${status.toLowerCase()} successfully.` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
