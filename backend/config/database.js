import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Set mongoose options to prevent deprecation warnings
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection options for production
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      bufferMaxEntries: 0 // Disable mongoose buffering
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`🔗 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('📦 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

    // Also handle SIGTERM for cloud deployments
    process.on('SIGTERM', async () => {
      try {
        await mongoose.connection.close();
        console.log('📦 MongoDB connection closed through SIGTERM');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error closing MongoDB connection on SIGTERM:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Log specific connection errors for debugging
    if (error.message.includes('IP')) {
      console.error('🔒 IP Whitelist Issue: Make sure your deployment IP is whitelisted in MongoDB Atlas');
      console.error('   - Go to Network Access in MongoDB Atlas');
      console.error('   - Add 0.0.0.0/0 (for testing) or specific Render IP ranges');
    }
    
    if (error.message.includes('authentication')) {
      console.error('🔑 Authentication Issue: Check your MongoDB connection string and credentials');
    }
    
    // In production, we might want to retry connection instead of exiting
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Retrying connection in 10 seconds...');
      setTimeout(() => {
        process.exit(1); // Let Render restart the service
      }, 10000);
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;
