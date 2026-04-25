const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function syncProfiles() {
    const accounts = [
        { email: 'farmer@example.com', password: 'password123', name: 'Ramesh Farmer', contact: '8208620901', role: 'Seller' },
        { email: 'buyer@example.com', password: 'password123', name: 'Priya Buyer', contact: '8208620902', role: 'Buyer' }
    ];

    for (const acc of accounts) {
        console.log(`\nSyncing ${acc.email}...`);
        const { data, error } = await supabase.auth.signInWithPassword({ email: acc.email, password: acc.password });
        
        if (error) {
            console.log(`❌ Auth login failed for ${acc.email}: ${error.message}`);
            continue;
        }

        const userId = data.user.id;
        console.log(`✅ Logged in. ID: ${userId}`);

        const { error: pError } = await supabase.from('profiles').upsert({
            id: userId,
            name: acc.name,
            contact: acc.contact,
            role: acc.role
        });

        if (pError) {
            console.log(`❌ Profile sync failed: ${pError.message}`);
        } else {
            console.log(`✅ Profile synced for ${acc.name}`);
        }
    }
}

syncProfiles();
