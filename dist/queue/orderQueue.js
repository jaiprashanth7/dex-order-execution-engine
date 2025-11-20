"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
const connection = new ioredis_1.default({
    host: config_1.config.redis.host,
    port: config_1.config.redis.port,
    maxRetriesPerRequest: null // 👈 required by BullMQ v5
});
exports.orderQueue = new bullmq_1.Queue('orders', { connection });
