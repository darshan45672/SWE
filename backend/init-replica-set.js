// Initialize replica set for MongoDB
// This script is automatically executed when the MongoDB container starts
print('Starting replica set initialization...');

try {
  // Wait a bit for MongoDB to be ready
  sleep(1000);
  
  // Initialize the replica set
  rs.initiate({
    _id: "rs0",
    version: 1,
    members: [
      {
        _id: 0,
        host: "localhost:27017",
        priority: 1
      }
    ]
  });
  
  print('Replica set initialized successfully');
} catch (error) {
  print('Error initializing replica set: ' + error);
}

// Wait for replica set to be ready
sleep(2000);

print('Replica set initialization complete');