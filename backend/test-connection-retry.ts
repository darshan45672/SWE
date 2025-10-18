// Simple MongoDB connection test with retries
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function testWithRetries() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found');
    return;
  }

  console.log('🔄 Testing MongoDB connection with retries...');
  
  const maxRetries = 3;
  const timeouts = [10000, 15000, 20000]; // Different timeout values
  
  for (let i = 0; i < maxRetries; i++) {
    console.log(`\n🔄 Attempt ${i + 1}/${maxRetries} with ${timeouts[i]}ms timeout...`);
    
    try {
      const client = new MongoClient(connectionString, {
        serverSelectionTimeoutMS: timeouts[i],
        connectTimeoutMS: timeouts[i],
        socketTimeoutMS: timeouts[i],
      });
      
      await client.connect();
      console.log('✅ Connection successful!');
      
      // Quick test
      const db = client.db('swe');
      await db.admin().ping();
      console.log('✅ Ping successful!');
      
      await client.close();
      console.log('✅ All tests passed! MongoDB is working correctly.');
      return;
      
    } catch (error) {
      console.log(`❌ Attempt ${i + 1} failed:`, error instanceof Error ? error.message : String(error));
      
      if (i < maxRetries - 1) {
        console.log('⏳ Waiting 2 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.log('\n❌ All connection attempts failed.');
  console.log('🛠️  Please verify:');
  console.log('   1. Your cluster hostname in MongoDB Atlas');
  console.log('   2. Network connectivity (try a different network/VPN)');
  console.log('   3. That the cluster is active and running');
}

testWithRetries();