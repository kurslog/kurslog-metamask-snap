import { resolveTokenSlug, isDexRouter } from '../src/transaction/tokenMap';

describe('tokenMap', () => {
  describe('isDexRouter', () => {
    it('recognizes Uniswap V2 router', () => {
      expect(isDexRouter('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')).toBe(true);
    });

    it('recognizes 1inch V6 (case insensitive)', () => {
      expect(isDexRouter('0x111111125421CA6dc452d289314280a0f8842A65')).toBe(true);
    });

    it('rejects unknown address', () => {
      expect(isDexRouter('0x0000000000000000000000000000000000000001')).toBe(false);
    });
  });

  describe('resolveTokenSlug', () => {
    it('resolves USDT on Ethereum', () => {
      expect(
        resolveTokenSlug('0xdAC17F958D2ee523a2206206994597C13D831ec7', 'eip155:1'),
      ).toBe('usdt-erc20');
    });

    it('resolves native ETH as ethereum', () => {
      expect(resolveTokenSlug('native', 'eip155:1')).toBe('ethereum');
    });

    it('resolves USDT on BSC as bep20', () => {
      expect(
        resolveTokenSlug('0x55d398326f99059fF775485246999027B3197955', 'eip155:56'),
      ).toBe('usdt-bep20');
    });

    it('resolves WETH as ethereum', () => {
      expect(
        resolveTokenSlug('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 'eip155:1'),
      ).toBe('ethereum');
    });

    it('returns null for unknown token', () => {
      expect(
        resolveTokenSlug('0x0000000000000000000000000000000000000001', 'eip155:1'),
      ).toBeNull();
    });

    it('returns null for unknown chain', () => {
      expect(
        resolveTokenSlug('0xdAC17F958D2ee523a2206206994597C13D831ec7', 'eip155:999'),
      ).toBeNull();
    });
  });
});
