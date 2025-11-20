import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import redisClient from '../config/redis.js';
import { protect } from '../middleware/authMiddleware.js';
import logger from '../config/logger.js';

dotenv.config();

const router = Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

const validateRegister = [
  body('username').notEmpty().withMessage('Usuário é obrigatório!').isLength({ min: 3 }).withMessage('Uusário deve ter mais de 3 letras.'),
  body('password').notEmpty().withMessage('Password é obrigatório').isLength({ min: 6 }).withMessage('A senha deve ter mais de 6 caracteres.'),
];

const validateLogin = [
  body('username').notEmpty().withMessage('Usuário é obrigatório!'),
  body('password').notEmpty().withMessage('A Senha é obrigátoria!'),
];

router.post('/users', validateRegister, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  logger.info(`Tentativa de registro para o usuário: ${username}`);

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      logger.warn(`Usuário já existe: ${username}`);
      return res.status(400).json({ message: 'Uusário já existe!!!' });
    }

    const user = await User.create({
      username,
      password,
    });

    if (user) {
      logger.info(`Usuário criado com sucesso: ${username}`);
      res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      logger.error(`Falha ao criar usuário: ${username}`);
      res.status(400).json({ message: 'Dados Inválidos' });
    }
  } catch (error) {
    logger.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro no Sistema' });
  }
});

router.post('/sessions', validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  logger.info(`Tentativa de login para o usuário: ${username}`);

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      logger.info(`Usuário logado com sucesso: ${username}`);
      res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      logger.warn(`Falha no login para o usuário: ${username}`);
      res.status(401).json({ message: 'Usuário ou senha inválidos' });
    }
  } catch (error) {
    logger.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro no Sistema' });
  }
});

router.delete('/sessions', protect, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    logger.info(`Tentativa de logout com o token: ${token}`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await redisClient.set(`invalidated_token:${token}`, 'true', 'EX', decoded.exp - Math.floor(Date.now() / 1000));
    logger.info(`Token invalidado com sucesso: ${token}`);
    res.status(200).json({ message: 'Logout bem-sucedido' });
  } catch (error) {
    logger.error('Erro ao fazer logout:', error);
    res.status(500).json({ message: 'Erro no Sistema' });
  }
});

export default router;
