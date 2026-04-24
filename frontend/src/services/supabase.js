import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qtdqpjzvadjghskixaaq.supabase.co";
const supabaseKey = "sb_publishable_ISja4DVTqvi9haYsnVIUuw_uSMoysj3";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth
export const signup = async (name, contact, password, role) => {
    try {
        const { data, error } = await supabase.from('users').insert([{ name, contact, password, role }]).select();
        if (error) throw error;
        return { success: true, user: data[0] };
    } catch (err) {
        return { success: false, message: 'Signup Error: ' + err.message };
    }
};

export const login = async (contact, password) => {
    try {
        const { data, error } = await supabase.from('users').select('*').eq('contact', contact).eq('password', password);
        if (error) throw error;
        if (data && data.length > 0) return { success: true, user: data[0] };
        return { success: false, message: 'Invalid credentials.' };
    } catch (err) {
        console.error("Login Supabase Error:", err);
        return { success: false, message: 'DB Error: ' + err.message };
    }
};

// Crops
export const addCrop = async (cropData, sessionName) => {
    try {
        const { error } = await supabase.from('crops').insert([{ ...cropData, status: 'Available', farmerName: sessionName }]);
        if (error) throw error;
        return { success: true };
    } catch (err) {
        alert("Failed to insert crop: " + err.message);
        return { success: false };
    }
};

export const fetchMyCrops = async (sessionName) => {
    const { data } = await supabase.from('crops').select('*').eq('farmerName', sessionName);
    return data || [];
};

export const fetchAvailableCrops = async () => {
    const { data } = await supabase.from('crops').select('*').eq('status', 'Available');
    return data || [];
};

// Offers
export const sendOffer = async (offerData, sessionName) => {
    const { error } = await supabase.from('offers').insert([{ ...offerData, status: 'Pending', buyerName: sessionName }]);
    if (error) return { message: error.message };
    return { message: "Offer sent successfully!" };
};

export const fetchMyOffers = async (session) => {
    if (session.role === 'Seller') {
        const myCrops = await fetchMyCrops(session.name);
        const cropIds = myCrops.map(c => c.id);
        if (cropIds.length === 0) return [];
        const { data: offersData } = await supabase.from('offers').select('*').in('cropId', cropIds);
        if (!offersData) return [];
        return offersData.map(o => ({ ...o, cropId: myCrops.find(c => c.id === o.cropId) }));
    } else {
        const { data } = await supabase.from('offers').select('*').eq('buyerName', session.name);
        if (!data) return [];
        const cropIds = data.map(o => o.cropId);
        if (cropIds.length > 0) {
            const { data: cropsData } = await supabase.from('crops').select('*').in('id', cropIds);
            return data.map(o => ({ ...o, cropId: cropsData?.find(c => c.id === o.cropId) }));
        }
        return data;
    }
};

export const updateOfferStatus = async (offerId, status, sessionName) => {
    const { data: updatedOfferData, error } = await supabase.from('offers').update({ status }).eq('id', offerId).select();
    if (error) return { message: error.message };
    
    if (status === 'Accepted' && updatedOfferData?.length > 0) {
        const offer = updatedOfferData[0];
        const { data: cropData } = await supabase.from('crops').select('*').eq('id', offer.cropId);
        const cropName = cropData?.[0]?.cropName || 'Agri-Product';
        
        await supabase.from('contracts').insert([{
            cropName,
            agreedPrice: offer.offeredPrice,
            status: 'Active',
            paymentStatus: 'Pending',
            buyerName: offer.buyerName,
            farmerName: sessionName
        }]);
        await supabase.from('crops').update({ status: 'Sold' }).eq('id', offer.cropId);
    }
    return { message: "Offer status updated!" };
};

// Contracts
export const fetchMyContracts = async (session) => {
    const roleField = session.role === 'Seller' ? 'farmerName' : 'buyerName';
    const { data } = await supabase.from('contracts').select('*').eq(roleField, session.name);
    return data || [];
};

export const markContractPaid = async (id) => {
    const { error } = await supabase.from('contracts').update({ paymentStatus: 'Paid' }).eq('id', id);
    if(error) return { message: error.message };
    return { message: "Payment marked as paid successfully." };
};
