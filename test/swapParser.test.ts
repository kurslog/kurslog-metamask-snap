import { parseSwapCalldata } from '../src/transaction/swapParser';

describe('swapParser', () => {
  describe('Uniswap V2 — swapExactTokensForTokens', () => {
    it('parses a valid swap with 2-token path', () => {
      // selector: 0x38ed1739
      // amountIn: 1000000000 (1000 USDT, 6 decimals)
      // amountOutMin: 500000000000000000 (0.5 ETH)
      // path offset: points to word 4 (0xa0 = 160 bytes = 5 words from start)
      // to: 0x0000...0001
      // deadline: 0xffffffff
      // path length: 2
      // path[0]: USDT address
      // path[1]: WETH address
      const amountIn = '000000000000000000000000000000000000000000000000000000003b9aca00'; // 1e9
      const amountOutMin = '00000000000000000000000000000000000000000000000006f05b59d3b20000'; // 0.5e18
      const pathOffset = '00000000000000000000000000000000000000000000000000000000000000a0'; // 160
      const to = '0000000000000000000000000000000000000000000000000000000000000001';
      const deadline = '00000000000000000000000000000000000000000000000000000000ffffffff';
      const pathLength = '0000000000000000000000000000000000000000000000000000000000000002';
      const token0 = '000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7'; // USDT
      const token1 = '000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; // WETH

      const data = '0x38ed1739' + amountIn + amountOutMin + pathOffset + to + deadline + pathLength + token0 + token1;

      const result = parseSwapCalldata(data, '0x0');
      expect(result).not.toBeNull();
      expect(result!.tokenIn).toBe('0xdac17f958d2ee523a2206206994597c13d831ec7');
      expect(result!.tokenOut).toBe('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');
      expect(result!.amountIn).toBe(1000000000n);
      expect(result!.amountOutMin).toBe(500000000000000000n);
    });
  });

  describe('Uniswap V2 — swapExactETHForTokens', () => {
    it('parses ETH→Token swap with value', () => {
      // selector: 0x7ff36ab5
      // amountOutMin: 1000000000 (1000 USDT)
      // path offset: 0x60 (96 = 3 words)
      // to: address
      // deadline: timestamp
      // path length: 2
      // path[0]: WETH
      // path[1]: USDT
      const amountOutMin = '000000000000000000000000000000000000000000000000000000003b9aca00';
      const pathOffset = '0000000000000000000000000000000000000000000000000000000000000060';
      const to = '0000000000000000000000000000000000000000000000000000000000000001';
      const pathLength = '0000000000000000000000000000000000000000000000000000000000000002';
      const weth = '000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
      const usdt = '000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7';

      const data = '0x7ff36ab5' + amountOutMin + pathOffset + to + pathLength + weth + usdt;
      const ethValue = '0xde0b6b3a7640000'; // 1 ETH in wei (hex)

      const result = parseSwapCalldata(data, ethValue);
      expect(result).not.toBeNull();
      expect(result!.tokenIn).toBe('native');
      expect(result!.tokenOut).toBe('0xdac17f958d2ee523a2206206994597c13d831ec7');
      expect(result!.amountIn).toBe(BigInt('0xde0b6b3a7640000'));
    });
  });

  describe('Uniswap V3 — exactInputSingle', () => {
    it('parses V3 single swap', () => {
      // selector: 0x414bf389
      // struct: tokenIn, tokenOut, fee, recipient, deadline, amountIn, amountOutMin, sqrtPriceLimit
      const tokenIn = '000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
      const tokenOut = '000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7';
      const fee = '0000000000000000000000000000000000000000000000000000000000000bb8'; // 3000
      const recipient = '0000000000000000000000000000000000000000000000000000000000000001';
      const deadline = '00000000000000000000000000000000000000000000000000000000ffffffff';
      const amountIn = '0000000000000000000000000000000000000000000000000de0b6b3a7640000'; // 1e18
      const amountOutMin = '000000000000000000000000000000000000000000000000000000003b9aca00'; // 1e9
      const sqrtPrice = '0000000000000000000000000000000000000000000000000000000000000000';

      const data = '0x414bf389' + tokenIn + tokenOut + fee + recipient + deadline + amountIn + amountOutMin + sqrtPrice;

      const result = parseSwapCalldata(data, '0x0');
      expect(result).not.toBeNull();
      expect(result!.tokenIn).toBe('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');
      expect(result!.tokenOut).toBe('0xdac17f958d2ee523a2206206994597c13d831ec7');
      expect(result!.amountIn).toBe(1000000000000000000n);
      expect(result!.amountOutMin).toBe(1000000000n);
    });
  });

  describe('Edge cases', () => {
    it('returns null for empty data', () => {
      expect(parseSwapCalldata('', '0x0')).toBeNull();
    });

    it('returns null for unknown selector', () => {
      expect(parseSwapCalldata('0xdeadbeef' + '0'.repeat(256), '0x0')).toBeNull();
    });

    it('returns null for too short data', () => {
      expect(parseSwapCalldata('0x38ed', '0x0')).toBeNull();
    });

    it('returns null for malformed calldata', () => {
      // Valid selector but truncated params
      expect(parseSwapCalldata('0x38ed1739' + '00'.repeat(10), '0x0')).toBeNull();
    });
  });
});
