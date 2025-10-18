import dotenv from 'dotenv';
import { testEmailConfiguration, sendVerificationEmail } from './src/services/email';

// Load environment variables
dotenv.config();

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Test 1: Verify connection
  console.log('📋 Test 1: Verifying SMTP connection...');
  const isValid = await testEmailConfiguration();
  
  if (!isValid) {
    console.error('❌ Email configuration is invalid!');
    console.error('Please check your .env file SMTP settings.');
    process.exit(1);
  }
  
  console.log('✅ SMTP connection verified!\n');
  
  // Test 2: Send test email
  console.log('📋 Test 2: Sending test verification email...');
  try {
    await sendVerificationEmail(
      'test@example.com',
      'Test User',
      'test-token-123456'
    );
    console.log('✅ Test email sent successfully!');
    console.log('\n📬 Check your Mailtrap inbox at: https://mailtrap.io/inboxes');
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
  }
}

testEmail()
  .then(() => {
    console.log('\n✅ Email testing complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Email testing failed:', error);
    process.exit(1);
  });
