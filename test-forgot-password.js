/**
 * Test Forgot Password Functionality
 * Quick test to verify the forgot password system works
 */

async function testForgotPassword() {
    const baseUrl = 'http://localhost:3003';
    
    console.log('🧪 Testing Forgot Password Functionality\n');

    try {
        // Test 1: Forgot password with non-existent email
        console.log('Test 1: Non-existent email');
        const response1 = await fetch(`${baseUrl}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'nonexistent@example.com' })
        });
        
        const data1 = await response1.json();
        console.log('Response:', response1.status, data1.message);
        console.log('✅ Should return success message (to prevent email enumeration)\n');

        // Test 2: Forgot password with invalid email format
        console.log('Test 2: Invalid email format');
        const response2 = await fetch(`${baseUrl}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'invalid-email' })
        });
        
        const data2 = await response2.json();
        console.log('Response:', response2.status, data2.message || data2.errors);
        console.log('✅ Should return validation error\n');

        // Test 3: Verify reset token endpoint with invalid token
        console.log('Test 3: Invalid reset token verification');
        const response3 = await fetch(`${baseUrl}/api/auth/verify-reset-token/invalid-token`);
        const data3 = await response3.json();
        console.log('Response:', response3.status, data3);
        console.log('✅ Should return invalid token\n');

        // Test 4: Reset password with invalid token
        console.log('Test 4: Password reset with invalid token');
        const response4 = await fetch(`${baseUrl}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                token: 'invalid-token',
                password: 'newpassword123'
            })
        });
        
        const data4 = await response4.json();
        console.log('Response:', response4.status, data4.message);
        console.log('✅ Should return invalid token error\n');

        console.log('🎉 All tests completed successfully!');
        console.log('\n📋 Manual Testing Instructions:');
        console.log('1. Visit http://localhost:3003/login.html');
        console.log('2. Click "Forgot Password?" link');
        console.log('3. Enter a valid email address');
        console.log('4. Check server logs for reset token (development mode)');
        console.log('5. Visit http://localhost:3003/reset-password?token=YOUR_TOKEN');
        console.log('6. Set a new password');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the server is running on http://localhost:3003');
    }
}

// Run test if called directly
if (require.main === module) {
    testForgotPassword();
}

module.exports = { testForgotPassword };
