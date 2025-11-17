import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import footballRouter from './routes/football.js';
import authRouter from './routes/auth.js';
import connectDB from './config/db.js';
import { protect } from './middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 3001;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: 'Houve um erro, volte mais tarde!',
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor subiu');
});

app.use('/api/football', protect, footballRouter);
app.use('/api/auth', authLimiter, authRouter);

app.listen(port, () => {
  console.log(`Servidor Rodando`);
});
