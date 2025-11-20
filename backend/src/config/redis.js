import Redis from 'ioredis';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on('connect', () => {
  logger.info('Conectado ao Redis');
});

redisClient.on('error', (err) => {
  logger.error('Houve um erro na conexão do Redis', err);
});

export default redisClient;
