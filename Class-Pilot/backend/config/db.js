import mongoose from "mongoose";

const connectWithRetry = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // Set strictQuery to false to prepare for Mongoose 7's default
      mongoose.set("strictQuery", false);
      
      // Connection options for better reliability
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000, // Increased timeout
        socketTimeoutMS: 45000,
        // Add DNS resolution options
        family: 4, // Use IPv4, skip trying IPv6
      };

      console.log(`🔄 Attempting MongoDB connection (attempt ${retries + 1}/${maxRetries})...`);
      const conn = await mongoose.connect(process.env.MONGO_URI, options);
      
      console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
      
      // Connection event handlers
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });

      return; // Success, exit retry loop
      
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB connection attempt ${retries} failed: ${error.message}`);
      
      if (retries === maxRetries) {
        console.error('❌ Max retries reached. Database connection failed.');
        console.log('💡 Troubleshooting tips:');
        console.log('   1. Check your internet connection');
        console.log('   2. Verify MongoDB Atlas IP whitelist (try 0.0.0.0/0 for development)');
        console.log('   3. Check if your network/firewall blocks MongoDB Atlas');
        console.log('   4. Try using a different network or mobile hotspot');
        
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        } else {
          console.log('🔄 Continuing in development mode without database...');
          return;
        }
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, retries) * 1000;
      console.log(`⏳ Waiting ${delay/1000} seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const connectDB = connectWithRetry;

export default connectDB;
