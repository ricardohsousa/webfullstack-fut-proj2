import { Router } from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import ChampionshipData from '../model/ChampionshipData.js';
import redisClient from '../config/redis.js';
import logger from '../config/logger.js';

import { protect } from '../middleware/authMiddleware.js';

dotenv.config();

const router = Router();
const API_KEY = process.env.VITE_API_FOOTBALL_KEY;
const API_HOST = 'v3.football.api-sports.io';
const BASE_URL = `https://${API_HOST}`;

router.use((req, res, next) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'API_KEY não foi encontrada' });
  }
  next();
});

router.get('/championships/:year', protect, async (req, res) => {
  const { year } = req.params;
  logger.info(`Recebida a solicitação de dados do campeonato para o ano: ${year}`);
  const league = 71;
  const cacheKey = `championship:${year}`;

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      logger.info(`Buscando o campeonato de ${year} do Redis.`);
      return res.json({ response: JSON.parse(cachedData) });
    }

    let championshipData = await ChampionshipData.findOne({ year });

    if (championshipData) {
      await redisClient.set(cacheKey, JSON.stringify({ rounds: championshipData.rounds, fixtures: championshipData.fixtures }), 'EX', 900);
      logger.info(`Buscando o campeonato de ${year} no Banco.`);
      return res.json({ response: { rounds: championshipData.rounds, fixtures: championshipData.fixtures } });
    }

    const headers = {
      'x-rapidapi-host': API_HOST,
      'x-rapidapi-key': API_KEY,
    };

    const [resRounds, resFixtures] = await Promise.all([
      fetch(`${BASE_URL}/fixtures/rounds?league=${league}&season=${year}`, { headers }),
      fetch(`${BASE_URL}/fixtures?league=${league}&season=${year}`, { headers })
    ]);

    const dataRounds = await resRounds.json();
    const dataFixtures = await resFixtures.json();

    if (dataRounds.response && dataFixtures.response) {
      championshipData = await ChampionshipData.create({
        year,
        rounds: dataRounds.response,
        fixtures: dataFixtures.response,
      });
      await redisClient.set(cacheKey, JSON.stringify({ rounds: championshipData.rounds, fixtures: championshipData.fixtures }), 'EX', 900);
      logger.info(`Buscando o campeonato de ${year} na API`);
      return res.json({ response: { rounds: championshipData.rounds, fixtures: championshipData.fixtures } });
    } else {
      return res.status(404).json({ message: 'Não foi encontrado dados para esse ano' });
    }

  } catch (error) {
    logger.error(`Houve um erro ao buscar dados do ano ${year}:`, error);
    res.status(500).json({ error: 'Erro no sistema' });
  }
});

export default router;
