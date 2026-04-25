async function testMobileLogin() {
    const baseUrl = 'http://localhost:5000/api';
    console.log("Testing login with mobile number: 8208620901");
    
    const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contact: '8208620901',
            password: 'password123'
        })
    });
    const data = await response.json();
    console.log("Response:", data);
}

testMobileLogin();
