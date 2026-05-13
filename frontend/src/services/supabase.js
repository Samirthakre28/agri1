import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';

export const supabase = (ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY) 
  ? createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY)
  : null;

const BACKEND_URL = ENV.API_URL;

// ─── AUTH ──────────────────────────────────────────────────

export const signup = async (name, contact, password, role, email) => {
    try {
        const response = await fetch(`${BACKEND_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, contact, password, role, email })
        });
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("Non-JSON API response for Signup");
            return { success: false, message: "Server error. Please ensure the backend is running." };
        }
        const result = await response.json();
        console.log("Signup response:", result);
        return result; 
    } catch (err) {
        console.error("Signup Fetch Error:", err);
        return { success: false, message: 'Network Error: ' + err.message };
    }
};

export const login = async (identifier, password) => {
    try {
        if (!identifier || !password) {
            return { success: false, message: "Please enter your email/mobile and password." };
        }

        // ─── HARDCODED DEMO ACCOUNTS ───────────────────────────────────
        const demoAccounts = {
            'seller@farmlink.com': {
                password: 'password123',
                user: { id: 'demo-seller', email: 'seller@farmlink.com', name: 'Demo Farmer', role: 'Seller', contact: '9876543210' }
            },
            'buyer@farmlink.com': {
                password: 'password123',
                user: { id: 'demo-buyer', email: 'buyer@farmlink.com', name: 'Demo Buyer', role: 'Buyer', contact: '9876543211' }
            }
        };

        if (demoAccounts[identifier] && demoAccounts[identifier].password === password) {
            const userData = demoAccounts[identifier].user;
            localStorage.setItem('farmlink_demo_session', JSON.stringify(userData));
            return { success: true, user: userData };
        }
        // ──────────────────────────────────────────────────────────────

        const body = identifier.includes('@') 
            ? { email: identifier, password } 
            : { contact: identifier, password };
            
        console.log("Login Request:", body);

        const response = await fetch(`${BACKEND_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("Non-JSON API response for Login");
            return { success: false, message: "Server error. Please ensure the backend is running or use a demo account." };
        }

        const result = await response.json();
        console.log("Login Response:", result);

        if (result.success && result.data?.session) {
            const { access_token, refresh_token } = result.data.session;
            await supabase.auth.setSession({ access_token, refresh_token });
            return { success: true, user: result.data.user };
        }
        
        return result;
    } catch (err) {
        console.error("Login Fetch Error:", err);
        return { success: false, message: 'Network Error: ' + err.message };
    }
};

export const forgotPassword = async (email) => {
    try {
        if (!email) return { success: false, message: "Please enter your email." };
        const response = await fetch(`${BACKEND_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return { success: false, message: "Server error. Please ensure the backend is running." };
        }
        return await response.json();
    } catch (err) {
        console.error("Forgot password error:", err);
        return { success: false, message: 'Network Error: ' + err.message };
    }
};

export const updatePassword = async (newPassword) => {
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error("Update password error:", err);
        return { success: false, message: err.message };
    }
};

export const resendVerification = async (email) => {
    try {
        if (!email) return { success: false, message: "Please enter your email." };
        const response = await fetch(`${BACKEND_URL}/resend-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return { success: false, message: "Server error. Please ensure the backend is running." };
        }
        return await response.json();
    } catch (err) {
        console.error("Resend verification error:", err);
        return { success: false, message: 'Network Error: ' + err.message };
    }
};

// ─── CROPS ─────────────────────────────────────────────────

export const addCrop = async (cropData, sessionName, sessionId) => {
    try {
        const { error } = await supabase.from('crops').insert([{ 
            ...cropData, 
            status: 'Available', 
            farmerName: sessionName
        }]);
        if (error) throw error;
        console.log("Crop listed successfully");
        return { success: true };
    } catch (err) {
        console.error("Failed to insert crop:", err.message);
        return { success: false, message: "Failed to list crop: " + err.message };
    }
};

export const fetchMyCrops = async (sessionName) => {
    try {
        const { data, error } = await supabase.from('crops').select('*').eq('farmerName', sessionName);
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error("Fetch my crops error:", err);
        return [];
    }
};

export const fetchAvailableCrops = async () => {
    try {
        const { data, error } = await supabase.from('crops').select('*').eq('status', 'Available');
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error("Fetch available crops error:", err);
        return [];
    }
};

// ─── OFFERS ────────────────────────────────────────────────

export const sendOffer = async (offerData, sessionName) => {
    try {
        const { error } = await supabase.from('offers').insert([{ 
            ...offerData, 
            status: 'Pending', 
            buyerName: sessionName 
        }]);
        if (error) throw error;
        return { message: "Offer sent successfully!" };
    } catch (err) {
        console.error("Send offer error:", err);
        return { message: "Failed to send offer: " + err.message };
    }
};

export const fetchMyOffers = async (session) => {
    try {
        if (session.role === 'Seller') {
            const myCrops = await fetchMyCrops(session.name);
            const cropIds = myCrops.map(c => c.id);
            if (cropIds.length === 0) return [];
            const { data: offersData, error } = await supabase.from('offers').select('*').in('cropId', cropIds);
            if (error) throw error;
            if (!offersData) return [];
            return offersData.map(o => ({ ...o, cropId: myCrops.find(c => c.id === o.cropId) }));
        } else {
            const { data, error } = await supabase.from('offers').select('*').eq('buyerName', session.name);
            if (error) throw error;
            if (!data) return [];
            const cropIds = data.map(o => o.cropId).filter(Boolean);
            if (cropIds.length > 0) {
                const { data: cropsData } = await supabase.from('crops').select('*').in('id', cropIds);
                return data.map(o => ({ ...o, cropId: cropsData?.find(c => c.id === o.cropId) }));
            }
            return data;
        }
    } catch (err) {
        console.error("Fetch offers error:", err);
        return [];
    }
};

export const procureCropWithAdvance = async (crop, bidPrice, sessionName, sessionId) => {
    try {
        // 1. Log the offer as 'Accepted' due to advance payment
        const { error: offerError } = await supabase.from('offers').insert([{
            cropId: crop.id, 
            offeredPrice: bidPrice, 
            status: 'Accepted', 
            buyerName: sessionName, 
            buyer_id: sessionId
        }]);
        if (offerError) {
            console.error("Offer insert error:", offerError);
            throw offerError;
        }
        
        // 2. Spawn an Active Contract immediately
        const { error: contractError } = await supabase.from('contracts').insert([{
            cropName: crop.cropName,
            agreedPrice: bidPrice,
            status: 'Active',
            paymentStatus: 'Pending Approval',
            buyerName: sessionName,
            farmerName: crop.farmerName,
            buyer_id: sessionId,
            farmer_id: null
        }]);
        if (contractError) {
            console.error("Contract insert error:", contractError);
            throw contractError;
        }

        // 3. Delist the crop
        const { error: cropError } = await supabase.from('crops').update({ status: 'Sold' }).eq('id', crop.id);
        if (cropError) console.error("Crop delist warning:", cropError);

        console.log("Contract secured with advance for:", crop.cropName);
        return { message: "Contract successfully secured with Advance Deposit!" };
    } catch (err) {
        console.error("procureCropWithAdvance error:", err);
        return { message: "Failed to secure contract: " + err.message };
    }
};

export const updateOfferStatus = async (offerId, status, sessionName, sessionId) => {
    try {
        const { data: updatedOfferData, error } = await supabase
            .from('offers')
            .update({ status })
            .eq('id', offerId)
            .select();
        if (error) throw error;
        
        if (status === 'Accepted' && updatedOfferData?.length > 0) {
            const offer = updatedOfferData[0];
            const { data: cropData } = await supabase.from('crops').select('*').eq('id', offer.cropId);
            const cropName = cropData?.[0]?.cropName || 'Agri-Product';
            
            const { error: contractError } = await supabase.from('contracts').insert([{
                cropName,
                agreedPrice: offer.offeredPrice,
                status: 'Active',
                paymentStatus: 'Pending',
                buyerName: offer.buyerName,
                farmerName: sessionName,
                buyer_id: offer.buyer_id || null,
                farmer_id: sessionId
            }]);
            if (contractError) {
                console.error("Contract creation on accept error:", contractError);
                throw contractError;
            }

            await supabase.from('crops').update({ status: 'Sold' }).eq('id', offer.cropId);
        }
        console.log("Offer status updated to:", status);
        return { message: "Offer status updated!" };
    } catch (err) {
        console.error("updateOfferStatus error:", err);
        return { message: "Failed to update offer: " + err.message };
    }
};

// ─── CONTRACTS ─────────────────────────────────────────────

export const fetchMyContracts = async (session) => {
    try {
        if (!session?.id) {
            console.error("fetchMyContracts: No session ID");
            return [];
        }
        const type = session.role === 'Seller' ? 'farmer' : 'buyer';
        console.log(`Fetching ${type} contracts for:`, session.id);
        
        const urlParams = session.role === 'Seller' ? encodeURIComponent(session.name) : session.id;
        const response = await fetch(`${BACKEND_URL}/contracts/${type}/${urlParams}`);
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("Non-JSON response for contracts fetch");
            return [];
        }
        
        const result = await response.json();
        console.log("Contracts fetched:", result.data?.length || 0);
        return result.data || [];
    } catch (err) {
        console.error("fetchMyContracts error:", err);
        return [];
    }
};

export const createContract = async (contractData) => {
    try {
        const response = await fetch(`${BACKEND_URL}/contracts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contractData)
        });
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return { success: false, message: "Server error." };
        }
        return await response.json();
    } catch (err) {
        console.error("createContract error:", err);
        return { success: false, message: err.message };
    }
};

export const markContractPaid = async (id) => {
    try {
        const response = await fetch(`${BACKEND_URL}/contracts/${id}/pay`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return { success: false, message: "Server error." };
        }
        return await response.json();
    } catch (err) {
        console.error("markContractPaid error:", err);
        return { success: false, message: err.message };
    }
};

export const updateContractStatus = async (id, status) => {
    try {
        const response = await fetch(`${BACKEND_URL}/contracts/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return { success: false, message: "Server error." };
        }
        return await response.json();
    } catch (err) {
        console.error("updateContractStatus error:", err);
        return { success: false, message: err.message };
    }
};
