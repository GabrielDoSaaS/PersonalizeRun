const mongoose = require('mongoose');

const connectToDb = async () => {
  try {
    await mongoose.connect('mongodb+srv://gabrield3vsilva_db_user:n2Jrmp0jlx4ZkQNX@cluster0.eus3bns.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

module.exports = connectToDb;  