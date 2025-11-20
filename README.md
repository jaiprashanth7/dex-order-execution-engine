DEX Order Execution Engine (Mock, Market Orders)
Overview

This project implements a mock order execution engine similar to those used by decentralized exchanges (DEXs) on the Solana network. It supports market order execution, DEX routing, real-time WebSocket status updates, and asynchronous order processing through BullMQ.

The implementation is intentionally lightweight and focuses on system architecture, routing logic, and execution flow.
All blockchain interactions (Raydium, Meteora) are mocked to maximize reliability and reproducibility.

Order Type Implemented: MARKET
Reason for Choosing Market Orders:
Market orders best demonstrate the full order-processing pipeline end-to-end—price routing, queueing, retries, and live updates—without additional complexity such as price triggers or on-chain event monitoring.

How the Engine Can Be Extended

Limit Orders: Store target price in the database and run a periodic price-checker job. Once the market/DEX price reaches the limit threshold, enqueue the order for execution.

Sniper Orders: Add a listener for new pool creation or token mint events. When a token launch event or liquidity pool becomes active, automatically enqueue the order.

Features

Market order execution flow

Raydium and Meteora mock DEX routing

WebSocket streaming for order lifecycle updates

BullMQ queue with concurrency, retry logic, and exponential backoff

PostgreSQL-based order history and error persistence

Redis-backed job queue and scalable architecture

Clear modular structure using TypeScript

System Architecture
1. Order Submission (HTTP)

Endpoint:

POST /api/orders/execute


Flow:

Validate request body (tokenIn, tokenOut, amount)

Insert a new order into PostgreSQL with status = pending

Enqueue the order into BullMQ (orders queue)

Respond with { orderId, status: "pending" }

2. WebSocket Status Updates

Clients connect to:

ws://<host>:3000/api/orders/execute?orderId=<uuid>


Status lifecycle events:

pending

routing (comparing Raydium/Meteora)

building (constructing mock transaction)

submitted (sent for execution)

confirmed (includes executedPrice and txHash)

failed (includes error message, after retry exhaustion)

3. Mock DEX Router

Simulates DEX behavior:

200–400 ms delay for price quotes

2–5% random price variance

Automatic best-price selection (Raydium vs Meteora)

Executes mock swap with 2–3 second delay

Slippage checks using MAX_SLIPPAGE_BPS

4. Queue Processor (BullMQ)

Queue name: orders

Worker concurrency: 10

Three retry attempts with exponential backoff

Failures are persisted with detailed reasons

Worker emits WebSocket status updates for each lifecycle stage

5. Database (PostgreSQL)

Each order record contains:

Order type

Token pair & amount

Status transitions

Selected DEX

Executed price

Transaction hash

Failure reason (if applicable)

Created/updated timestamps

Project Structure
src/
  config.ts
  server.ts
  db.ts

  routes/
    orderRoute.ts

  services/
    orderService.ts
    dexRouter.ts

  queue/
    orderQueue.ts
    orderWorker.ts

  websocket/
    orderWs.ts

  models/
    orderModel.ts

tests/                // unit + integration tests
postman_collection.json
README.md
.env.example

Local Setup
1. Clone the Repository
git clone <your-repo-url> dex-execution-engine
cd dex-execution-engine
npm install

2. Start Redis and PostgreSQL Using Docker
docker run --name dex-redis -p 6379:6379 -d redis:7

docker run --name dex-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dex_engine \
  -p 5432:5432 \
  -d postgres:16

3. Create .env
PORT=3000

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# PostgreSQL
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=dex_engine

# Mock pricing config
BASE_PRICE_SOL_USDC=150
MAX_SLIPPAGE_BPS=100

4. Start the Development Server
npm run dev


Server runs at:

http://localhost:3000

How to Use
1. Create a Market Order (HTTP request)
curl -X POST http://localhost:3000/api/orders/execute \
  -H "Content-Type: application/json" \
  -d '{"tokenIn":"SOL","tokenOut":"USDC","amount":1}'


Example response:

{
  "orderId": "3668bd16-f439-4b1f-a454-19d3636823ac",
  "status": "pending"
}

2. Listen to WebSocket Updates

Using wscat:

wscat -c "ws://localhost:3000/api/orders/execute?orderId=<orderId>"


Expected output sequence:

{"status":"pending"}
{"status":"routing"}
{"status":"building"}
{"status":"submitted"}
{"status":"confirmed","data":{"dex":"meteora","executedPrice":150.03,"txHash":"0xabc..."}}

3. Inspect Database Results

Connect to Postgres:

docker exec -it dex-postgres psql -U postgres -d dex_engine


Check recent orders:

SELECT id, status, selected_dex, executed_price, tx_hash
FROM orders
ORDER BY created_at DESC;

Testing

Tests should validate:

DEX router logic

Quote variance and slippage

Order queue behavior (success, retry, failure)

Correct WebSocket events emitted

Database persistence

API validation rules

Place tests inside the tests/ directory:

npm test

Postman Collection

A Postman/Insomnia collection is included:

postman_collection.json


It contains:

POST /api/orders/execute

WebSocket request for lifecycle updates

Deployment

Recommended platforms:

Railway

Render

Fly.io

DigitalOcean Apps

Required services in production:

Node.js server

Managed PostgreSQL

Managed Redis

Environment variables matching .env

Build command:

npm run build


Start command:

npm run start