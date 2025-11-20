import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  port: Number(process.env.PORT) || 3000,

  redisUrl: process.env.REDIS_URL, // <-- IMPORTANT: use a flat key

  pg: {
    host: process.env.PGHOST || (isProd ? undefined : '127.0.0.1'),
    port: process.env.PGPORT ? Number(process.env.PGPORT) : (isProd ? undefined : 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'dex_engine'
  },

  basePrices: {
    'SOL/USDC': Number(process.env.BASE_PRICE_SOL_USDC) || 150
  },

  maxSlippageBps: Number(process.env.MAX_SLIPPAGE_BPS) || 100
};
