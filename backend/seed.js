const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Crop = require('./models/Crop');
const Offer = require('./models/Offer');
const Contract = require('./models/Contract');

const MONGO_URI = 'mongodb://127.0.0.1:27017/agricontract';

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Crop.deleteMany({});
        await Offer.deleteMany({});
        await Contract.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        // 1. Create Farmers
        const farmers = await User.insertMany([
            { name: 'Rajesh Kumar', contact: '9876543210', password, role: 'Seller' },
            { name: 'Sanjay Deshmukh', contact: '9876543211', password, role: 'Seller' },
            { name: 'Vijay Patil', contact: '9876543212', password, role: 'Seller' },
            { name: 'Amit Singh', contact: '9876543213', password, role: 'Seller' }
        ]);

        // 2. Create Buyers
        const buyers = await User.insertMany([
            { name: 'Agro Traders Pvt Ltd', contact: '8876543210', password, role: 'Buyer' },
            { name: 'FreshFarm Exports', contact: '8876543211', password, role: 'Buyer' },
            { name: 'GreenLeaf Foods', contact: '8876543212', password, role: 'Buyer' }
        ]);

        // 3. Create Crops
        const cropData = [
            { farmer: farmers[0], name: 'Premium Wheat', qty: '500 Quintals', price: 2150, loc: 'Ludhiana, Punjab', type: 'Wheat' },
            { farmer: farmers[1], name: 'Mahyco Sugarcane', qty: '1200 Tons', price: 3100, loc: 'Satara, Maharashtra', type: 'Sugarcane' },
            { farmer: farmers[2], name: 'Hybrid Maize', qty: '350 Quintals', price: 1850, loc: 'Haveri, Karnataka', type: 'Maize' },
            { farmer: farmers[3], name: 'Shankar-6 Cotton', qty: '200 Quintals', price: 6200, loc: 'Rajkot, Gujarat', type: 'Cotton' },
            { farmer: farmers[0], name: 'Basmati Rice', qty: '150 Quintals', price: 4500, loc: 'Amritsar, Punjab', type: 'Rice' }
        ];

        const insertedCrops = [];
        for (const c of cropData) {
            const crop = new Crop({
                farmerId: c.farmer._id,
                farmerName: c.farmer.name,
                cropName: c.name,
                quantity: c.qty,
                price: c.price,
                location: c.loc,
                status: 'Available'
            });
            await crop.save();
            insertedCrops.push(crop);
        }

        // 4. Create Offers
        const offerData = [
            { buyer: buyers[0], crop: insertedCrops[0], price: 2100, status: 'Accepted' },
            { buyer: buyers[1], crop: insertedCrops[1], price: 3050, status: 'Pending' },
            { buyer: buyers[2], crop: insertedCrops[2], price: 1900, status: 'Accepted' },
            { buyer: buyers[0], crop: insertedCrops[3], price: 6150, status: 'Pending' }
        ];

        for (const o of offerData) {
            const offer = new Offer({
                cropId: o.crop._id,
                buyerId: o.buyer._id,
                buyerName: o.buyer.name,
                farmerId: o.crop.farmerId,
                offeredPrice: o.price,
                status: o.status
            });
            await offer.save();

            // 5. Create Contracts for Accepted Offers
            if (o.status === 'Accepted') {
                const contract = new Contract({
                    cropId: o.crop._id,
                    offerId: offer._id,
                    buyerId: o.buyer._id,
                    farmerId: o.crop.farmerId,
                    cropName: o.crop.cropName,
                    buyerName: o.buyer.name,
                    farmerName: (await User.findById(o.crop.farmerId)).name,
                    agreedPrice: o.price,
                    quantity: o.crop.quantity,
                    paymentStatus: o.crop.cropName.includes('Wheat') ? 'Paid' : 'Pending',
                    status: 'Active'
                });
                await contract.save();

                // Update crop status
                o.crop.status = 'Accepted';
                await o.crop.save();
            }
        }

        console.log('Database successfully seeded with realistic agricultural data!');
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedData();
