import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  port: Number(process.env.PORT) || 3000,

  // Redis: prefer REDIS_URL if present, otherwise host/port/password
//   redis: {
//     url: process.env.REDIS_URL, // e.g. redis://default:password@host:port
//     host: process.env.REDIS_HOST || (isProd ? undefined : '127.0.0.1'),
//     port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : (isProd ? undefined : 6379),
    
//     password: process.env.REDIS_PASSWORD || undefined
//   },
  redis: {
    host: process.env.REDIS_HOST!,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD!,
    tls: {}
  },
  

  // Postgres (Railway Postgres envs will override these defaults)
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
