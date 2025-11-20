"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildServer = buildServer;
const fastify_1 = __importDefault(require("fastify"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const order_route_1 = require("./routes/order.route");
async function buildServer() {
    const fastify = (0, fastify_1.default)({ logger: true });
    await fastify.register(websocket_1.default);
    await fastify.register(order_route_1.orderRoutes);
    return fastify;
}
