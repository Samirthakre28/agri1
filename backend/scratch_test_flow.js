async function testFlow() {
    const baseUrl = 'http://localhost:5000/api';
    const email = 'test' + Date.now() + '@example.com';
    const password = 'password123';
    
    console.log("1. Registering new user...");
    const regRes = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test User',
            email: email,
            password: password,
            contact: '1234567890',
            role: 'Seller'
        })
    });
    console.log("Register StatusCode:", regRes.status);
    const regData = await regRes.json();
    console.log("Register Response:", regData);

    if (regRes.ok) {
        console.log("2. Attempting login immediately...");
        const logRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        console.log("Login StatusCode:", logRes.status);
        const logData = await logRes.json();
        console.log("Login Response:", logData);
    }
}

testFlow();
