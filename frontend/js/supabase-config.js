const supabaseUrl = "https://qtdqpjzvadjghskixaaq.supabase.co";
const supabaseKey = "sb_publishable_ISja4DVTqvi9haYsnVIUuw_uSMoysj3";

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
    console.log("Testing Supabase Connection & Adding Dummy Data...");
    try {
        // 1. Try to INSERT dummy data
        const dummyPayload = { message: "Dummy test run at " + new Date().toLocaleTimeString() };
        console.log("Attempting to insert dummy data:", dummyPayload);
        const { error: insertError } = await supabase.from('test').insert([dummyPayload]);
        
        if (insertError) {
            console.warn("⚠️ Insert failed. Note: This could just mean your 'test' table is missing a 'message' column or RLS is blocking inserts.", insertError);
        } else {
            console.log("✅ Dummy data inserted successfully!");
        }

        // 2. Try to FETCH data back
        const { data, error } = await supabase.from('test').select('*').limit(5);
        
        console.log("Connection Test Results (Fetch):");
        console.log("Data:", data);
        console.log("Error:", error);
        
        if (error) {
            console.error("❌ Connection or permission error! See above.");
        } else {
            console.log("✅ Supabase is connected and data was fetched successfully!");
        }
    } catch (err) {
        console.error("❌ Unexpected error during connection check:", err);
    }
}

// Automatically check connection
checkConnection();
