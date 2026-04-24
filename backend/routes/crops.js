const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Crop = require('../models/Crop');

// @route   POST api/crops
// @desc    Add a new crop
router.post('/', auth, async (req, res) => {
    const { cropName, quantity, price, location } = req.body;

    try {
        const newCrop = new Crop({
            farmerId: req.user.id,
            farmerName: req.user.name,
            cropName,
            quantity,
            price,
            location
        });

        const crop = await newCrop.save();
        res.json({ success: true, message: 'Crop added successfully!', crop });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/crops
// @desc    Get all crops (Marketplace)
router.get('/', async (req, res) => {
    try {
        const crops = await Crop.find({ status: 'Available' }).sort({ dateAdded: -1 });
        res.json(crops);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/crops/my
// @desc    Get logged-in farmer's crops
router.get('/my', auth, async (req, res) => {
    try {
        const crops = await Crop.find({ farmerId: req.user.id }).sort({ dateAdded: -1 });
        res.json(crops);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
