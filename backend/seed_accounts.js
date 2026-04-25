async function createAccounts() {
    const baseUrl = 'http://localhost:5000/api';
    
    const accounts = [
        {
            name: 'Ramesh Farmer',
            email: 'farmer@example.com',
            password: 'password123',
            contact: '8208620901',
            role: 'Seller'
        },
        {
            name: 'Priya Buyer',
            email: 'buyer@example.com',
            password: 'password123',
            contact: '8208620902',
            role: 'Buyer'
        }
    ];

    console.log("🚀 Creating test accounts through the backend...");

    for (const account of accounts) {
        try {
            console.log(`\nCreating ${account.role}: ${account.email}...`);
            const response = await fetch(`${baseUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(account)
            });
            const data = await response.json();
            console.log(`✅ Result: ${data.message}`);
        } catch (err) {
            console.error(`❌ Error: ${err.message}`);
        }
    }

    console.log("\n-----------------------------------------");
    console.log("SELLER ACCOUNT:");
    console.log("Email: farmer@example.com");
    console.log("Mobile: 8208620901");
    console.log("Password: password123");
    console.log("\nBUYER ACCOUNT:");
    console.log("Email: buyer@example.com");
    console.log("Mobile: 8208620902");
    console.log("Password: password123");
    console.log("-----------------------------------------");
}

createAccounts();
