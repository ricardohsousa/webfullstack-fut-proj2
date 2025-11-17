import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on('connect', () => {
  console.log('Conectado');
});

redisClient.on('error', (err) => {
  console.error('Houve um erro', err);
});

export default redisClient;
