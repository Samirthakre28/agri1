const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    farmerName: {
        type: String,
        required: true
    },
    cropName: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'Accepted'],
        default: 'Available'
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Crop', CropSchema);
