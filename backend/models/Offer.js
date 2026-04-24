const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
    cropId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop',
        required: true
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyerName: {
        type: String,
        required: true
    },
    offeredPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    dateOffered: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate offers from same buyer on same crop
OfferSchema.index({ cropId: 1, buyerId: 1 }, { unique: true });

module.exports = mongoose.model('Offer', OfferSchema);
