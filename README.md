# Kurslog Rate Tracker

A MetaMask Snap that helps you find the best OTC exchange rates for cash-out in your city.

## Features

- **Transaction Insight** — When you swap tokens on Uniswap, SushiSwap, 1inch, or PancakeSwap, see the best OTC cash-out rates (Card UAH, Cash UAH, Cash USD) directly on the transaction confirmation screen
- **Home Page** — Browse popular exchange directions with real-time rates
- **Rate Check** — Compare rates from 100+ exchangers for any currency pair
- **Multi-country** — Supports 98 countries and 285 cities with localized names (Ukrainian, Russian, English)

## Supported DEXs

Uniswap V2/V3, Uniswap Universal Router, SushiSwap, 1inch v5/v6, PancakeSwap V2/V3, QuickSwap

## Supported Networks

Ethereum, Polygon, BSC

## Permissions

| Permission | Purpose |
|-----------|---------|
| `snap_dialog` | Display rate check results |
| `snap_getPreferences` | Auto-detect user language |
| `snap_manageState` | Save city, country, language preferences |
| `endowment:network-access` | Fetch rates from Kurslog API |
| `endowment:page-home` | Home page tab in MetaMask |
| `endowment:transaction-insight` | Show OTC rates during token swaps |

## Install

Install from npm in MetaMask Flask:

```
npm:@kurslog/metamask-snap
```

## Development

```bash
npm install
npx mm-snap watch
```

## Testing

```bash
npx jest
```

## License

MIT

## Links

- Website: [kurslog.com](https://kurslog.com)
- npm: [@kurslog/metamask-snap](https://www.npmjs.com/package/@kurslog/metamask-snap)
