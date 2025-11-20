"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const config_1 = require("./config");
const orderWorker_1 = require("./queue/orderWorker");
async function main() {
    const app = await (0, server_1.buildServer)(); // <--- this is the function we just exported
    (0, orderWorker_1.startOrderWorker)();
    try {
        await app.listen({ port: config_1.config.port, host: '0.0.0.0' });
        console.log(`Server listening on http://localhost:${config_1.config.port}`);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}
main();
