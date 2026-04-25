async function testLogin() {
    const baseUrl = 'http://localhost:5000/api';
    console.log("🔍 Checking if accounts are logged-in ready...");
    
    try {
        const response = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'farmer6@example.com',
                password: 'password123'
            })
        });
        const data = await response.json();
        if (response.ok) {
            console.log("✅ LOGIN SUCCESS! Database and Auth are ready.");
        } else {
            console.log(`⚠️ LOGIN FAILED: ${data.message}`);
        }
    } catch (err) {
        console.error(`❌ Connection error: ${err.message}`);
    }
}

testLogin();
