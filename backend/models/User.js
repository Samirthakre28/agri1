const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Buyer', 'Seller'],
        required: true
    },
    dateJoined: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
