import { config } from '../config';

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export interface DexQuote {
  dex: 'raydium' | 'meteora';
  price: number; // tokenOut per tokenIn
  fee: number;   // 0.003 = 0.3%
}

export interface ExecutionResult {
  dex: 'raydium' | 'meteora';
  txHash: string;
  executedPrice: number;
}

export class MockDexRouter {
  private getBasePrice(tokenIn: string, tokenOut: string) {
    const key = `${tokenIn}/${tokenOut}`;
    // tell TS this is a generic map
    const basePrices = config.basePrices as Record<string, number>;
    const value = basePrices[key];
    return value ?? 100; // fallback
  }

  async getRaydiumQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DexQuote> {
    const basePrice = this.getBasePrice(tokenIn, tokenOut);
    await sleep(200 + Math.random() * 200);
    const price = basePrice * (0.98 + Math.random() * 0.04); // 0.98 to 1.02
    return { dex: 'raydium', price, fee: 0.003 };
  }

  async getMeteoraQuote(tokenIn: string, tokenOut: string, amount: number): Promise<DexQuote> {
    const basePrice = this.getBasePrice(tokenIn, tokenOut);
    await sleep(200 + Math.random() * 200);
    const price = basePrice * (0.97 + Math.random() * 0.05); // 0.97 to 1.02
    return { dex: 'meteora', price, fee: 0.002 };
  }

  async getBestQuote(tokenIn: string, tokenOut: string, amount: number) {
    const [raydium, meteora] = await Promise.all([
      this.getRaydiumQuote(tokenIn, tokenOut, amount),
      this.getMeteoraQuote(tokenIn, tokenOut, amount)
    ]);

    const best = raydium.price > meteora.price ? raydium : meteora;
    return { best, all: { raydium, meteora } };
  }

  async executeSwap(
    dex: 'raydium' | 'meteora',
    params: { tokenIn: string; tokenOut: string; amount: number; quotedPrice: number }
  ): Promise<ExecutionResult> {
    await sleep(2000 + Math.random() * 1000);

    // simulate small price movement and slippage check
    const slippageFactor = 1 + (Math.random() - 0.5) * 0.01; // ±0.5%
    const executedPrice = params.quotedPrice * slippageFactor;

    const maxSlippage = config.maxSlippageBps / 10_000; // 1% default
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

export const dexRouter = new MockDexRouter();
