import { sendOrderStatus } from '../src/websocket/orderWs';

describe('WebSocket manager', () => {
  it('does not throw if no clients exist for order', () => {
    expect(() =>
      sendOrderStatus('non-existent', { status: 'pending' })
    ).not.toThrow();
  });
});
