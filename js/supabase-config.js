// Replace YOUR_SUPABASE_URL here
const supabaseUrl = "YOUR_SUPABASE_URL";
// Replace YOUR_SUPABASE_KEY here
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) {
            console.error("Supabase connection failed:", error.message);
            alert("Supabase connection failed: " + error.message);
        } else {
            console.log("Supabase connection successful!", data);
        }
    } catch (err) {
        console.error("Supabase connection failed:", err.message);
        alert("Supabase connection failed: " + err.message);
    }
}

// Test connection on load
testConnection();
