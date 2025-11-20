"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = orderRoutes;
const orderService_1 = require("../services/orderService");
const orderWs_1 = require("../websocket/orderWs");
async function orderRoutes(fastify) {
    fastify.post('/api/orders/execute', async (req, reply) => {
        const body = req.body;
        if (!body?.tokenIn || !body?.tokenOut || typeof body?.amount !== 'number') {
            return reply.code(400).send({ error: 'tokenIn, tokenOut, amount are required' });
        }
        const order = await (0, orderService_1.createMarketOrder)({
            tokenIn: body.tokenIn,
            tokenOut: body.tokenOut,
            amount: body.amount
        });
        return reply.send({ orderId: order.id, status: order.status });
    });
    fastify.get('/api/orders/execute', { websocket: true }, (connection, req) => {
        const orderId = req.query.orderId;
        if (!orderId) {
            connection.socket.send(JSON.stringify({ error: 'orderId query param required' }));
            connection.socket.close();
            return;
        }
        (0, orderWs_1.registerOrderSocket)(orderId, connection, req);
        connection.socket.send(JSON.stringify({ orderId, status: 'pending' }));
    });
}
