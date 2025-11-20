"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderSocket = registerOrderSocket;
exports.sendOrderStatus = sendOrderStatus;
const orderClients = new Map();
function registerOrderSocket(orderId, conn, _req) {
    const clients = orderClients.get(orderId) || new Set();
    conn.orderId = orderId;
    clients.add(conn);
    orderClients.set(orderId, clients);
    conn.socket.on('close', () => {
        const set = orderClients.get(orderId);
        if (set) {
            set.delete(conn);
            if (set.size === 0)
                orderClients.delete(orderId);
        }
    });
}
function sendOrderStatus(orderId, payload) {
    const clients = orderClients.get(orderId);
    if (!clients)
        return;
    const msg = JSON.stringify({ orderId, ...payload });
    for (const c of clients) {
        c.socket.send(msg);
    }
}
