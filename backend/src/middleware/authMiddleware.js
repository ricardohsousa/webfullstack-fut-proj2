import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import dotenv from 'dotenv';
import redisClient from '../config/redis.js';

dotenv.config();

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const isInvalidated = await redisClient.get(`invalidated_token:${token}`);
      if (isInvalidated) {
        return res.status(401).json({ message: 'Não Autorizado' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Não Autorizado' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não Autorizado' });
  }
};

export { protect };
