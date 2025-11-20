"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dexRouter = exports.MockDexRouter = void 0;
const config_1 = require("../config");
function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}
class MockDexRouter {
    getBasePrice(tokenIn, tokenOut) {
        const key = `${tokenIn}/${tokenOut}`;
        // tell TS this is a generic map
        const basePrices = config_1.config.basePrices;
        const value = basePrices[key];
        return value ?? 100; // fallback
    }
    async getRaydiumQuote(tokenIn, tokenOut, amount) {
        const basePrice = this.getBasePrice(tokenIn, tokenOut);
        await sleep(200 + Math.random() * 200);
        const price = basePrice * (0.98 + Math.random() * 0.04); // 0.98 to 1.02
        return { dex: 'raydium', price, fee: 0.003 };
    }
    async getMeteoraQuote(tokenIn, tokenOut, amount) {
        const basePrice = this.getBasePrice(tokenIn, tokenOut);
        await sleep(200 + Math.random() * 200);
        const price = basePrice * (0.97 + Math.random() * 0.05); // 0.97 to 1.02
        return { dex: 'meteora', price, fee: 0.002 };
    }
    async getBestQuote(tokenIn, tokenOut, amount) {
        const [raydium, meteora] = await Promise.all([
            this.getRaydiumQuote(tokenIn, tokenOut, amount),
            this.getMeteoraQuote(tokenIn, tokenOut, amount)
        ]);
        const best = raydium.price > meteora.price ? raydium : meteora;
        return { best, all: { raydium, meteora } };
    }
    async executeSwap(dex, params) {
        await sleep(2000 + Math.random() * 1000);
        // simulate small price movement and slippage check
        const slippageFactor = 1 + (Math.random() - 0.5) * 0.01; // ±0.5%
        const executedPrice = params.quotedPrice * slippageFactor;
        const maxSlippage = config_1.config.maxSlippageBps / 10000; // 1% default
        const deviation = Math.abs(executedPrice - params.quotedPrice) / params.quotedPrice;
        if (deviation > maxSlippage) {
            throw new Error(`Slippage exceeded: deviation=${(deviation * 100).toFixed(2)}%`);
        }
        const txHash = `0x${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
        return {
            dex,
            txHash,
            executedPrice
        };
    }
}
exports.MockDexRouter = MockDexRouter;
exports.dexRouter = new MockDexRouter();
