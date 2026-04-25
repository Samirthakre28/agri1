import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qtdqpjzvadjghskixaaq.supabase.co";
const supabaseKey = "sb_publishable_ISja4DVTqvi9haYsnVIUuw_uSMoysj3";

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log("Seeding started...");

    // 1. Users
    const farmers = [
        { name: "Rajesh Patil", contact: "9876500001", password: "password123", role: "Seller" },
        { name: "Suresh Deshmukh", contact: "9876500002", password: "password123", role: "Seller" },
        { name: "Amit Sharma", contact: "9876500003", password: "password123", role: "Seller" }
    ];
    
    const buyers = [
        { name: "GreenLeaf Foods", contact: "1234500001", password: "password123", role: "Buyer" },
        { name: "AgriTrade Corp", contact: "1234500002", password: "password123", role: "Buyer" },
        { name: "FreshHarvest Logistics", contact: "1234500003", password: "password123", role: "Buyer" }
    ];

    const { error: userErr } = await supabase.from('users').insert([...farmers, ...buyers]);
    if(userErr) console.log("Users setup error:", userErr.message);
    else console.log("Users inserted.");

    // 2. Crops
    const cropsToInsert = [
        { cropName: "Wheat (Lokwan)", quantity: "50 Quintals", price: 2800, location: "Pune, MH", farmerName: "Rajesh Patil", status: "Available" },
        { cropName: "Sugarcane", quantity: "100 Tons", price: 3200, location: "Kolhapur, MH", farmerName: "Rajesh Patil", status: "Sold" },
        { cropName: "Rice (Basmati)", quantity: "40 Quintals", price: 3800, location: "Nagpur, MH", farmerName: "Suresh Deshmukh", status: "Available" },
        { cropName: "Cotton", quantity: "20 Quintals", price: 6500, location: "Amravati, MH", farmerName: "Suresh Deshmukh", status: "Available" },
        { cropName: "Maize", quantity: "80 Quintals", price: 1900, location: "Nashik, MH", farmerName: "Amit Sharma", status: "Sold" }
    ];

    const { data: crops, error: cropErr } = await supabase.from('crops').insert(cropsToInsert).select();
    if(cropErr) {
        console.log("Crop Error:", cropErr.message);
        return;
    }
    console.log("Crops inserted.");

    // 3. Offers
    const sugarcaneId = crops.find(c => c.cropName === "Sugarcane")?.id;
    const maizeId = crops.find(c => c.cropName === "Maize")?.id;
    const wheatId = crops.find(c => c.cropName === "Wheat (Lokwan)")?.id;
    const riceId = crops.find(c => c.cropName === "Rice (Basmati)")?.id;
    const cottonId = crops.find(c => c.cropName === "Cotton")?.id;

    const offersToInsert = [
        { cropId: sugarcaneId, offeredPrice: 3200, status: "Accepted", buyerName: "GreenLeaf Foods" },
        { cropId: maizeId, offeredPrice: 1850, status: "Accepted", buyerName: "AgriTrade Corp" },
        { cropId: wheatId, offeredPrice: 2750, status: "Pending", buyerName: "FreshHarvest Logistics" },
        { cropId: riceId, offeredPrice: 3700, status: "Rejected", buyerName: "GreenLeaf Foods" },
        { cropId: cottonId, offeredPrice: 6600, status: "Pending", buyerName: "AgriTrade Corp" }
    ];

    const { error: offerErr } = await supabase.from('offers').insert(offersToInsert);
    if(offerErr) console.log("Offer Error:", offerErr.message);
    else console.log("Offers inserted.");

    // 4. Contracts + Payments Context
    const contractsToInsert = [
        { cropName: "Sugarcane", agreedPrice: 320000, status: "Active", paymentStatus: "Paid", buyerName: "GreenLeaf Foods", farmerName: "Rajesh Patil" },
        { cropName: "Maize", agreedPrice: 152000, status: "Active", paymentStatus: "Pending", buyerName: "AgriTrade Corp", farmerName: "Amit Sharma" }
    ];

    const { error: contractErr } = await supabase.from('contracts').insert(contractsToInsert);
    if(contractErr) console.log("Contract Error:", contractErr.message);
    else console.log("Contracts and Payment States inserted.");

    console.log("-----------------------------------------");
    console.log("Seeding complete!");
    console.log("You can login to see a populated dashboard:");
    console.log("Farmer: Rajesh Patil -> Mobile: 9876500001 | Pass: password123");
    console.log("Buyer: GreenLeaf Foods -> Mobile: 1234500001 | Pass: password123");
}

seed();
