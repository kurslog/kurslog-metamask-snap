export interface ParsedSwap {
  tokenIn: string; // address or 'native'
  tokenOut: string;
  amountIn: bigint;
  amountOutMin: bigint;
}

/** Function selectors for known swap methods */
const SELECTORS: Record<string, string> = {
  '0x38ed1739': 'swapExactTokensForTokens',
  '0x8803dbee': 'swapTokensForExactTokens',
  '0x7ff36ab5': 'swapExactETHForTokens',
  '0x18cbafe5': 'swapExactTokensForETH',
  '0x414bf389': 'exactInputSingle',
  '0xc04b8d59': 'exactInput',
  '0x12aa3caf': 'swap',
  '0x0502b1c5': 'unoswap',
};

/** Decode a uint256 from hex calldata at a given word offset */
function decodeUint256(data: string, wordOffset: number): bigint {
  const start = 10 + wordOffset * 64; // skip '0x' + 4-byte selector
  const hex = data.slice(start, start + 64);
  if (hex.length < 64) return 0n;
  return BigInt('0x' + hex);
}

/** Decode an address from calldata at a given word offset */
function decodeAddress(data: string, wordOffset: number): string {
  const start = 10 + wordOffset * 64;
  const hex = data.slice(start, start + 64);
  return '0x' + hex.slice(24).toLowerCase();
}

/** Decode a dynamic array of addresses (path) */
function decodePath(data: string, pathOffsetWord: number): string[] {
  const offsetValue = Number(decodeUint256(data, pathOffsetWord));
  const arrayStart = 10 + offsetValue * 2;
  const lengthHex = data.slice(arrayStart, arrayStart + 64);
  const length = Number(BigInt('0x' + lengthHex));

  const addresses: string[] = [];
  for (let i = 0; i < length; i++) {
    const addrStart = arrayStart + 64 + i * 64;
    const addrHex = data.slice(addrStart, addrStart + 64);
    addresses.push('0x' + addrHex.slice(24).toLowerCase());
  }
  return addresses;
}

/**
 * Parse swap transaction calldata.
 * Returns null if the transaction is not a recognized swap.
 */
export function parseSwapCalldata(
  data: string,
  value: string,
): ParsedSwap | null {
  if (!data || data.length < 10) return null;

  const selector = data.slice(0, 10).toLowerCase();
  const method = SELECTORS[selector];
  if (!method) return null;

  try {
    switch (method) {
      case 'swapExactTokensForTokens': {
        // (uint amountIn, uint amountOutMin, address[] path, address to, uint deadline)
        const amountIn = decodeUint256(data, 0);
        const amountOutMin = decodeUint256(data, 1);
        const path = decodePath(data, 2);
        if (path.length < 2) return null;
        return { tokenIn: path[0], tokenOut: path[path.length - 1], amountIn, amountOutMin };
      }

      case 'swapTokensForExactTokens': {
        // (uint amountOut, uint amountInMax, address[] path, address to, uint deadline)
        const amountOutMin = decodeUint256(data, 0);
        const amountIn = decodeUint256(data, 1);
        const path = decodePath(data, 2);
        if (path.length < 2) return null;
        return { tokenIn: path[0], tokenOut: path[path.length - 1], amountIn, amountOutMin };
      }

      case 'swapExactETHForTokens': {
        // (uint amountOutMin, address[] path, address to, uint deadline)
        const amountOutMin = decodeUint256(data, 0);
        const path = decodePath(data, 1);
        if (path.length < 2) return null;
        const ethValue = value ? BigInt(value) : 0n;
        return { tokenIn: 'native', tokenOut: path[path.length - 1], amountIn: ethValue, amountOutMin };
      }

      case 'swapExactTokensForETH': {
        // (uint amountIn, uint amountOutMin, address[] path, address to, uint deadline)
        const amountIn = decodeUint256(data, 0);
        const amountOutMin = decodeUint256(data, 1);
        const path = decodePath(data, 2);
        if (path.length < 2) return null;
        return { tokenIn: path[0], tokenOut: 'native', amountIn, amountOutMin };
      }

      case 'exactInputSingle': {
        // struct ExactInputSingleParams { tokenIn, tokenOut, fee, recipient, deadline, amountIn, amountOutMinimum, sqrtPriceLimitX96 }
        const tokenIn = decodeAddress(data, 0);
        const tokenOut = decodeAddress(data, 1);
        // fee at word 2, recipient at word 3, deadline at word 4
        const amountIn = decodeUint256(data, 5);
        const amountOutMin = decodeUint256(data, 6);
        return { tokenIn, tokenOut, amountIn, amountOutMin };
      }

      case 'swap': {
        // 1inch swap(address executor, SwapDescription desc, bytes data)
        // SwapDescription: { IERC20 srcToken, IERC20 dstToken, ... }
        // desc starts at offset in word 1
        const descOffset = Number(decodeUint256(data, 1));
        const descStart = 10 + descOffset * 2;
        const srcToken = '0x' + data.slice(descStart + 24, descStart + 64).toLowerCase();
        const dstToken = '0x' + data.slice(descStart + 64 + 24, descStart + 128).toLowerCase();
        // amount at desc+128, minReturn at desc+192
        const amountIn = BigInt('0x' + data.slice(descStart + 128, descStart + 192));
        const amountOutMin = BigInt('0x' + data.slice(descStart + 192, descStart + 256));
        return { tokenIn: srcToken, tokenOut: dstToken, amountIn, amountOutMin };
      }

      default:
        return null;
    }
  } catch {
    return null;
  }
}
