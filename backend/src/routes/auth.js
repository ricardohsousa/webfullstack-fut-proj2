import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';

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

router.post('/register', validateRegister, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: 'Uusário já existe!!!' });
    }

    const user = await User.create({
      username,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Dados Inválidos' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no Sistema' });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Usuário ou senha inválidos' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no Sistema' });
  }
});

export default router;
