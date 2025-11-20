import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import dotenv from 'dotenv';
import logger from '../config/logger.js';
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
      logger.info(`Verificando o token: ${token}`);
      const isInvalidated = await redisClient.get(`invalidated_token:${token}`);
      if (isInvalidated) {
        logger.warn(`Token invalidado recebido: ${token}`);
        return res.status(401).json({ message: 'Não Autorizado' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      logger.info(`Token verificado com sucesso para o usuário: ${req.user.username}`);

      next();
    } catch (error) {
      logger.error('Falha na verificação do token:', error);
      res.status(401).json({ message: 'Não Autorizado' });
    }
  }

  if (!token) {
    logger.warn('Nenhum token fornecido');
    res.status(401).json({ message: 'Não Autorizado' });
  }
};

export { protect };
