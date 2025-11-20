"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultJobOptions = void 0;
exports.startOrderWorker = startOrderWorker;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
const dexRouter_1 = require("../services/dexRouter");
const orderWs_1 = require("../websocket/orderWs");
const orderModel_1 = require("../models/orderModel");
const connection = new ioredis_1.default({
    host: config_1.config.redis.host,
    port: config_1.config.redis.port,
    maxRetriesPerRequest: null
});
function startOrderWorker() {
    const worker = new bullmq_1.Worker('orders', async (job) => {
        const { orderId, tokenIn, tokenOut, amount } = job.data;
        try {
            // routing
            (0, orderWs_1.sendOrderStatus)(orderId, { status: 'routing' });
            await (0, orderModel_1.updateOrderStatus)(orderId, 'routing');
            const { best, all } = await dexRouter_1.dexRouter.getBestQuote(tokenIn, tokenOut, amount);
            console.log('[router] order', orderId, 'raydium=', all.raydium, 'meteora=', all.meteora, 'selected=', best.dex);
            await (0, orderModel_1.updateOrderStatus)(orderId, 'building', { selectedDex: best.dex });
            (0, orderWs_1.sendOrderStatus)(orderId, {
                status: 'building',
                data: { selectedDex: best.dex, quotes: all }
            });
            // building tx (simulated)
            (0, orderWs_1.sendOrderStatus)(orderId, { status: 'submitted' });
            await (0, orderModel_1.updateOrderStatus)(orderId, 'submitted');
            const exec = await dexRouter_1.dexRouter.executeSwap(best.dex, {
                tokenIn,
                tokenOut,
                amount,
                quotedPrice: best.price
            });
            await (0, orderModel_1.updateOrderStatus)(orderId, 'confirmed', {
                executedPrice: exec.executedPrice,
                txHash: exec.txHash
            });
            (0, orderWs_1.sendOrderStatus)(orderId, {
                status: 'confirmed',
                data: {
                    dex: exec.dex,
                    txHash: exec.txHash,
                    executedPrice: exec.executedPrice
                }
            });
        }
        catch (err) {
            console.error('[orderWorker] order failed', orderId, err?.message || err);
            await (0, orderModel_1.updateOrderStatus)(orderId, 'failed', {
                failureReason: err?.message || 'unknown error'
            });
            (0, orderWs_1.sendOrderStatus)(orderId, {
                status: 'failed',
                data: { error: err?.message || 'unknown error' }
            });
            throw err; // let BullMQ handle retries (attempts/backoff below)
        }
    }, {
        connection,
        concurrency: 10
    });
    // listen for permanently failed jobs
    worker.on('failed', (job, err) => {
        console.log('[orderWorker] job permanently failed', job?.id, err?.message);
    });
    return worker;
}
exports.defaultJobOptions = {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 1000
    },
    removeOnComplete: 1000,
    removeOnFail: 1000
};
