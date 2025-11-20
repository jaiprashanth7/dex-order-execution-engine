import { MockDexRouter } from '../src/services/dexRouter';

describe('MockDexRouter', () => {
  const router = new MockDexRouter();

  it('returns both Raydium and Meteora quotes', async () => {
    const { best, all } = await router.getBestQuote('SOL', 'USDC', 1);
    expect(all.raydium).toBeDefined();
    expect(all.meteora).toBeDefined();
    expect(best.dex === 'raydium' || best.dex === 'meteora').toBe(true);
  });

  it('executes swap with slippage protection', async () => {
    const { best } = await router.getBestQuote('SOL', 'USDC', 1);
    const result = await router.executeSwap(best.dex, {
      tokenIn: 'SOL',
      tokenOut: 'USDC',
      amount: 1,
      quotedPrice: best.price
    });
    expect(result.txHash).toBeDefined();
    expect(result.executedPrice).toBeGreaterThan(0);
  });
});
