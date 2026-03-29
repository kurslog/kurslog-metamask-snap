/** Known DEX router addresses → DEX name */
export const DEX_ROUTERS: Record<string, string> = {
  // Uniswap V2
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'uniswap-v2',
  // Uniswap V3 SwapRouter (same address on Ethereum, Polygon, Arbitrum)
  '0xe592427a0aece92de3edee1f18e0157c05861564': 'uniswap-v3',
  // Uniswap Universal Router (Ethereum)
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': 'uniswap-universal',
  // Uniswap Universal Router (Polygon) — multiple versions
  '0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5': 'uniswap-universal',
  '0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b': 'uniswap-universal',
  '0x643770e279d5d0733f21d6dc03a8efbabf3255b4': 'uniswap-universal',
  '0xec7be89e9d109e7e3fec59c222cf297125fefda2': 'uniswap-universal',
  // Uniswap V4 Universal Router (Polygon)
  '0x1095692a6237d83c6a72f3f5efedb9a670c49223': 'uniswap-universal',
  // SushiSwap
  '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': 'sushiswap',
  // 1inch v5
  '0x1111111254eeb25477b68fb85ed929f73a960582': '1inch-v5',
  // 1inch v6
  '0x111111125421ca6dc452d289314280a0f8842a65': '1inch-v6',
  // MetaMask Swap Router (Ethereum)
  '0x881d40237659c251811cec9c364ef91dc08d300c': 'metamask-swap',
  // MetaMask Swap Router (BSC)
  '0x1a1ec25dc08e98e5e93f1104b5e5cdd298707d31': 'metamask-swap',
  // QuickSwap (Polygon)
  '0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff': 'quickswap',
  // PancakeSwap V2 (BSC)
  '0x10ed43c718714eb63d5aa57b78b54704e256024e': 'pancakeswap-v2',
  // PancakeSwap V3 (BSC)
  '0x13f4ea83d0bd40e75c8222255bc855a974568dd4': 'pancakeswap-v3',
};

/** ERC-20 token address → KursLog currency slug, by chain */
export const TOKEN_MAP: Record<string, Record<string, string>> = {
  'eip155:1': {
    // Ethereum Mainnet
    '0xdac17f958d2ee523a2206206994597c13d831ec7': 'usdt-erc20',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'usdc-erc20',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'bitcoin', // WBTC → bitcoin on KursLog
    '0x6b175474e89094c44da98b954eedeac495271d0f': 'dai',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'ethereum', // WETH
    native: 'ethereum',
  },
  'eip155:137': {
    // Polygon
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': 'usdt-erc20',
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': 'usdc-polygon',
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6': 'bitcoin',
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': 'ethereum',
    native: 'polygon',
  },
  'eip155:56': {
    // BSC
    '0x55d398326f99059ff775485246999027b3197955': 'usdt-bep20',
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': 'usdc-bep20',
    '0x2170ed0880ac9a755fd29b2688956bd959f933f8': 'ethereum',
    native: 'bnb-bep20',
  },
};

/** Resolve a token address to a KursLog slug */
export function resolveTokenSlug(
  address: string,
  chainId: string,
): string | null {
  const chainTokens = TOKEN_MAP[chainId];
  if (!chainTokens) return null;
  return chainTokens[address.toLowerCase()] || null;
}

/** Check if an address is a known DEX router */
export function isDexRouter(address: string): boolean {
  return address.toLowerCase() in DEX_ROUTERS;
}

/**
 * Scan raw calldata for known token addresses on a given chain.
 * Returns all found token slugs (deduplicated).
 */
export function scanCalldataForTokens(
  data: string,
  chainId: string,
): string[] {
  const chainTokens = TOKEN_MAP[chainId];
  if (!chainTokens) return [];

  const dataLower = data.toLowerCase();
  const found: string[] = [];
  const seen = new Set<string>();

  for (const [address, slug] of Object.entries(chainTokens)) {
    if (address === 'native') continue;
    // Token addresses in calldata are zero-padded to 32 bytes: 000000000000000000000000{address}
    const padded = '000000000000000000000000' + address.replace('0x', '');
    if (dataLower.includes(padded) && !seen.has(slug)) {
      seen.add(slug);
      found.push(slug);
    }
  }

  return found;
}
