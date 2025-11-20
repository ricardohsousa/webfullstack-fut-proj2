import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`HOuve um erro ao conectar no Mongo: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
