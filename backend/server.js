const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase Init
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const apiRouter = express.Router();

// ─── AUTH ROUTES ───────────────────────────────────────────

apiRouter.post('/register', async (req, res) => {
    const { name, contact, password, role, email } = req.body;
    console.log("Register Request:", { name, contact, role, email });
    try {
        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: "Name, email and password are required." });
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email, password,
            options: { data: { display_name: name, contact, role } }
        });
        if (authError) {
            console.error("Supabase signUp error:", authError);
            return res.status(400).json({ success: false, message: authError.message });
        }

        // The auto-trigger on auth.users will create the profiles row.
        // But if trigger is missing or fails, insert manually as a safety net:
        const { error: profileError } = await supabase.from('profiles').upsert([{
            id: authData.user.id,
            name,
            contact,
            role,
        }], { onConflict: 'id' });

        if (profileError) {
            console.log("❌ Profile insert error:", profileError.message);
            console.log("Full profile error object:", profileError);
        } else {
            console.log("✅ Profile row created successfully for ID:", authData.user.id);
        }

        console.log("Registration process complete for:", email);
        res.status(201).json({ success: true, message: "Registration successful!", data: authData.user });
    } catch (err) {
        console.error("Register Server Error:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

apiRouter.post('/login', async (req, res) => {
    console.log("Login Request Body:", req.body);
    const { contact, email, password } = req.body;
    let identifier = email || contact;
    
    try {
        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: "Email/Mobile and Password are required." });
        }
        
        let loginEmail = identifier;
        
        // If user entered a mobile number, look up their email from profiles table
        if (!identifier.includes('@')) {
            const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('id')
                .eq('contact', identifier.toString())
                .single();
            
            if (userError || !userData) {
                console.error("Profile lookup failed:", userError);
                return res.status(404).json({ success: false, message: "User not found with this mobile number." });
            }
            
            // Fetch the email from auth.users via admin API  
            const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userData.id);
            if (authError || !authUser?.user?.email) {
                console.error("Auth user lookup failed:", authError);
                return res.status(404).json({ success: false, message: "User not found. Please try logging in with email." });
            }
            loginEmail = authUser.user.email;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        
        if (error) {
            console.error("Supabase Login Failed:", error);
            return res.status(401).json({ success: false, message: "Invalid credentials. Please try again." });
        }

        console.log("Login Success for:", data.user.email);
        return res.json({
            success: true,
            message: "Login successful",
            data: { 
                user: {
                    id: data.user.id, 
                    email: data.user.email,
                    name: data.user.user_metadata?.display_name || data.user.user_metadata?.name || 'User',
                    role: data.user.user_metadata?.role || 'Seller',
                    contact: data.user.user_metadata?.contact || ''
                },
                session: data.session
            }
        });
    } catch (err) {
        console.error("Login Server Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});

apiRouter.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    console.log("Forgot password request for:", email);
    try {
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required." });
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
            console.error("Forgot password error:", error);
            throw error;
        }
        res.json({ success: true, message: "Password reset link sent to your email." });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message || "Failed to send reset email." });
    }
});

apiRouter.post('/resend-verification', async (req, res) => {
    const { email } = req.body;
    console.log("Resend verification for:", email);
    try {
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required." });
        }
        const { error } = await supabase.auth.resend({ type: 'signup', email });
        if (error) throw error;
        res.json({ success: true, message: "Verification email sent successfully." });
    } catch (err) {
        console.error("Resend verification error:", err);
        res.status(400).json({ success: false, message: err.message });
    }
});

// ─── CONTRACT ROUTES ───────────────────────────────────────

apiRouter.get('/contracts/farmer/:name', async (req, res) => {
    try {
        const decodedName = decodeURIComponent(req.params.name);
        console.log("Fetching farmer contracts for:", decodedName);
        const { data, error } = await supabase
            .from('contracts')
            .select(`
                *,
                farmer:profiles!contracts_farmer_id_fkey(name, contact, role),
                buyer:profiles!contracts_buyer_id_fkey(name, contact, role)
            `)
            .eq('farmerName', decodedName)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (err) {
        console.error("Farmer contracts fetch error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

apiRouter.get('/contracts/buyer/:id', async (req, res) => {
    console.log("Fetching buyer contracts for:", req.params.id);
    try {
        const { data, error } = await supabase
            .from('contracts')
            .select(`
                *,
                farmer:profiles!contracts_farmer_id_fkey(name, contact, role),
                buyer:profiles!contracts_buyer_id_fkey(name, contact, role)
            `)
            .eq('buyer_id', req.params.id)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (err) {
        console.error("Buyer contracts fetch error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

apiRouter.post('/contracts', async (req, res) => {
    console.log("Creating contract:", req.body);
    try {
        const { data, error } = await supabase.from('contracts').insert([req.body]).select();
        if (error) throw error;
        res.status(201).json({ success: true, message: "Contract created.", data: data?.[0] });
    } catch (err) {
        console.error("Contract create error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

apiRouter.patch('/contracts/:id/pay', async (req, res) => {
    console.log("Marking contract paid:", req.params.id);
    try {
        const { error } = await supabase.from('contracts').update({ paymentStatus: 'Paid' }).eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true, message: "Payment successful." });
    } catch (err) {
        console.error("Payment update error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

apiRouter.patch('/contracts/:id/status', async (req, res) => {
    console.log("Updating contract status:", req.params.id, "to", req.body.status);
    try {
        const { status } = req.body;
        // If Farmer accepts, we keep status Active but advance the payment phase
        if (status === 'Active') {
            const { error } = await supabase.from('contracts').update({ paymentStatus: 'Advance Paid' }).eq('id', req.params.id);
            if (error) throw error;
        } 
        // If Farmer rejects, we change the core status to Cancelled (which is allowed by constraint)
        else if (status === 'Cancelled') {
            const { error } = await supabase.from('contracts').update({ status: 'Cancelled', paymentStatus: 'Refunded' }).eq('id', req.params.id);
            if (error) throw error;
        } else {
            throw new Error("Invalid status update");
        }
        res.json({ success: true, message: `Contract successfully updated.` });
    } catch (err) {
        console.error("Status update error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

apiRouter.get('/health', (req, res) => {
    res.json({ success: true, status: 'ok' });
});

// Mount Router
app.use('/api', apiRouter);

// Health Check on Root
app.get('/', (req, res) => res.json({ success: true, message: "AgriContract API is alive" }));

// Global Error Handler (must have 4 params to work as Express error handler)
app.use((err, req, res, next) => {
    console.error("Global Express Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
