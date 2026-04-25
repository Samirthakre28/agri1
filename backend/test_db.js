const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testConnection() {
    console.log("Testing Supabase connection...");
    try {
        // Test 1: Get profiles
        const { count: pCount, error: pError } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        if (pError) throw pError;
        console.log("✅ Successfully connected to 'profiles' table. Row count:", pCount);

        // Test 2: Get contracts
        const { count: cCount, error: cError } = await supabase.from('contracts').select('*', { count: 'exact', head: true });
        if (cError) throw cError;
        console.log("✅ Successfully connected to 'contracts' table. Row count:", cCount);

        // Test 3: Get crops
        const { count: cropCount, error: cropError } = await supabase.from('crops').select('*', { count: 'exact', head: true });
        if (cropError) throw cropError;
        console.log("✅ Successfully connected to 'crops' table. Row count:", cropCount);

        console.log("\nDATABASE IS FULLY WORKING!");
    } catch (err) {
        console.error("❌ Database test failed:", err.message);
        console.error("Full error:", err);
    }
}

testConnection();
