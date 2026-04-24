const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
    cropId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop',
        required: true
    },
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
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
    cropName: String,
    buyerName: String,
    farmerName: String,
    agreedPrice: {
        type: Number,
        required: true
    },
    quantity: String,
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Cancelled'],
        default: 'Active'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contract', ContractSchema);
