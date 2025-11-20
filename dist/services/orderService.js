"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMarketOrder = createMarketOrder;
const uuid_1 = require("uuid");
const orderModel_1 = require("../models/orderModel");
const orderQueue_1 = require("../queue/orderQueue");
const orderWorker_1 = require("../queue/orderWorker");
async function createMarketOrder(payload) {
    const id = (0, uuid_1.v4)();
    const order = {
        id,
        type: 'MARKET',
        tokenIn: payload.tokenIn,
        tokenOut: payload.tokenOut,
        amount: payload.amount,
        status: 'pending'
    };
    // persist initial order
    await (0, orderModel_1.insertOrder)(order);
    // enqueue execution job with retries + backoff
    await orderQueue_1.orderQueue.add('execute', {
        orderId: id,
        tokenIn: order.tokenIn,
        tokenOut: order.tokenOut,
        amount: order.amount
    }, orderWorker_1.defaultJobOptions);
    return order;
}
