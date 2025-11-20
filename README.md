DEX Order Execution Engine (Mock Implementation)
Overview

This project implements a simplified order execution engine inspired by Solana-based DEX workflows. It supports market order execution, routing across Raydium and Meteora, and real-time WebSocket updates.
All DEX interactions are fully mocked to provide deterministic behavior while focusing on system design, queueing, and event-driven architecture.

Key Features

Market order processing with full lifecycle tracking

Raydium/Meteora mock routing with quote variation and slippage checks

WebSocket streaming of execution status

BullMQ worker with concurrency, retries, and exponential backoff

PostgreSQL persistence for all order states and outcomes

Modular TypeScript codebase following separation of concerns

Architecture Summary

HTTP Order Submission

POST /api/orders/execute

Creates order in PostgreSQL (status: pending)

Enqueues job into BullMQ

WebSocket Status Updates

ws://localhost:3000/api/orders/execute?orderId=<uuid>

Streams lifecycle events: pending → routing → building → submitted → confirmed/failed

DEX Routing (Mock)

Simulated Raydium/Meteora quotes

Price variance of 2–5%

Best-price selection

Simulated swap execution with final price and transaction hash

Queue Execution

Worker concurrency: 10

Automatic retries (3 attempts)

Failure reasons stored in database

Data Persistence
Each order stores:
type, token pair, status, DEX used, executed price, txHash, timestamps.

Supported Order Type

Market Order
Selected for simplicity and completeness of workflow demonstration.

Extendability

Limit Orders: evaluate price conditions before queueing.

Sniper Orders: trigger execution upon token launch or new pool creation.

Tech Stack

Node.js, TypeScript

Fastify (HTTP + WebSocket)

BullMQ + Redis

PostgreSQL

Jest (unit/integration tests)

Installation
npm install


Start Redis and PostgreSQL (example using Docker):

docker run --name dex-redis -p 6379:6379 -d redis:7

docker run --name dex-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dex_engine \
  -p 5432:5432 \
  -d postgres:16


Run the development server:

npm run dev

Usage

Submit an order:

curl -X POST http://localhost:3000/api/orders/execute \
  -H "Content-Type: application/json" \
  -d '{"tokenIn":"SOL","tokenOut":"USDC","amount":1}'


Listen to WebSocket updates:

wscat -c "ws://localhost:3000/api/orders/execute?orderId=<uuid>"


Query database:

SELECT * FROM orders ORDER BY created_at DESC;

Testing
npm test


Includes routing logic tests, queue behavior tests, and WebSocket lifecycle tests.

Repository Structure
src/
  config.ts
  server.ts
  db.ts
  routes/
  services/
  queue/
  websocket/
  models/
tests/
postman_collection.json
.env.example

Deployment

Compatible with Railway, Render, Fly.io, or any Node.js environment.
Requires provisioned PostgreSQL, Redis, and environment variables matching .env.example.