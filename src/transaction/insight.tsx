import type { OnTransactionHandler } from '@metamask/snaps-sdk';
import {
  Box,
  Heading,
  Text,
  Section,
  Card,
  Link,
  Banner,
  Divider,
} from '@metamask/snaps-sdk/jsx';
import { isDexRouter, resolveTokenSlug, TOKEN_MAP, scanCalldataForTokens } from './tokenMap';
import { parseSwapCalldata } from './swapParser';
import { getFiatTargets } from './fiatTargets';
import { fetchTopRates } from '../api/client';
import { getState } from '../state/manager';
import { formatNumber } from '../utils/format';
import { t } from '../utils/i18n';
import { getCityName, getCountryName } from '../utils/locationNames';
import type { RateItem } from '../api/types';

interface InsightRate {
  label: string;
  rate: RateItem;
  total: number;
  currency: string;
  fiatSlug: string;
  tokenSlug: string;
}

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}) => {
  const to = transaction.to as string;
  const toLower = to?.toLowerCase() || '';
  const isKnownDex = isDexRouter(toLower);

  const data = transaction.data as string;
  const value = transaction.value as string;

  if (!to) return null;

  const swap = parseSwapCalldata(data, value);

  let inputSlug: string | null = null;
  let outputSlug: string | null = null;

  // Method 1: parse known swap methods (Uniswap V2/V3, 1inch)
  if (swap) {
    inputSlug = resolveTokenSlug(swap.tokenIn, chainId);
    outputSlug = resolveTokenSlug(swap.tokenOut, chainId);
  }

  // Method 2: scan calldata for known token addresses (works for Universal Router, MetaMask Swap, etc.)
  if (!inputSlug || !outputSlug) {
    const foundTokens = scanCalldataForTokens(data || '', chainId);
    const chainTokens = TOKEN_MAP[chainId];
    const nativeSlug = chainTokens?.native;

    // Determine which is input and which is output
    let hasNativeValue = false;
    try {
      hasNativeValue = !!value && value !== '0x0' && value !== '0x' && BigInt(value) > 0n;
    } catch { /* ignore */ }

    if (!inputSlug && !outputSlug) {
      if (nativeSlug && hasNativeValue) {
        inputSlug = nativeSlug;
        outputSlug = foundTokens.find((t) => t !== nativeSlug) || null;
      } else if (foundTokens.length >= 2) {
        inputSlug = foundTokens[0];
        outputSlug = foundTokens[foundTokens.length - 1];
        if (inputSlug === outputSlug && foundTokens.length > 2) {
          outputSlug = foundTokens[1];
        }
      } else if (foundTokens.length === 1 && nativeSlug) {
        inputSlug = nativeSlug;
        outputSlug = foundTokens[0];
      }
    } else if (!outputSlug && foundTokens.length > 0) {
      outputSlug = foundTokens.find((t) => t !== inputSlug) || null;
    } else if (!inputSlug && foundTokens.length > 0) {
      inputSlug = foundTokens.find((t) => t !== outputSlug) || nativeSlug || null;
    }
  }

  // Method 3: fallback to native token
  if (!inputSlug && !outputSlug) {
    const chainTokens = TOKEN_MAP[chainId];
    if (chainTokens?.native) {
      inputSlug = chainTokens.native;
    }
  }

  // Not a known DEX and no tokens found — skip
  if (!inputSlug && !outputSlug) return null;

  // If not a known DEX and couldn't parse anything useful — skip
  if (!isKnownDex && !inputSlug && !outputSlug) return null;

  const state = await getState();
  const { locale, countryUrl, cityUrl } = state.settings;
  const fiatTargets = getFiatTargets(countryUrl);

  const fetches: Array<{
    type: 'output' | 'input';
    label: string;
    currency: string;
    fiatSlug: string;
    tokenSlug: string;
    promise: Promise<{ rates: RateItem[] }>;
  }> = [];

  for (const target of fiatTargets) {
    const city = target.needsCity ? cityUrl : undefined;

    if (inputSlug) {
      fetches.push({
        type: 'input',
        label: target.label,
        currency: target.currency,
        fiatSlug: target.slug,
        tokenSlug: inputSlug,
        promise: fetchTopRates(inputSlug, target.slug, 1, city, locale).catch(
          () => ({ rates: [] }),
        ),
      });
    }
  }

  const results = await Promise.all(fetches.map((f) => f.promise));

  const inputRates: InsightRate[] = [];

  // Calculate input amount
  let inputAmount = 0;

  if (swap) {
    inputAmount = Number(swap.amountIn) / 1e18;
  } else {
    // Fallback: use transaction.value for native token input amount
    try {
      if (value && value !== '0x0' && value !== '0x') {
        inputAmount = Number(BigInt(value)) / 1e18;
      }
    } catch { /* ignore */ }
  }

  for (let i = 0; i < fetches.length; i++) {
    const f = fetches[i];
    const d = results[i];
    if (!d.rates.length) continue;

    const rate = d.rates[0];
    const rateRatio = rate.rate_out / rate.rate_in;

    const item: InsightRate = {
      label: f.label,
      rate,
      total: inputAmount * rateRatio,
      currency: f.currency,
      fiatSlug: f.fiatSlug,
      tokenSlug: f.tokenSlug,
    };

    inputRates.push(item);
  }

  if (inputRates.length === 0) return null;

  // Build URL with city for cash directions
  function buildUrl(tokenSlug: string, fiatSlug: string): string {
    const needsCity = fiatSlug.includes('cash-');
    const cityPart = needsCity && cityUrl ? `-in-${cityUrl}` : '';
    return `https://kurslog.com/${tokenSlug}-to-${fiatSlug}${cityPart}`;
  }

  const cityDisplay = getCityName(cityUrl, locale);
  const countryDisplay = getCountryName(countryUrl, locale);

  // Token display name
  const tokenName = inputSlug?.toUpperCase().split('-')[0] || outputSlug?.toUpperCase().split('-')[0] || '';

  const content = (
    <Box>
      <Section>
        <Heading size="lg">Kurslog.com</Heading>
        <Text>{cityDisplay}, {countryDisplay}</Text>
      </Section>

      {inputSlug && inputRates.length > 0 && (
        <Section>
          <Banner title={t('orSellDirectly', locale)} severity="info">
            <Text>{inputSlug.toUpperCase().split('-')[0]} → {t('cashOut', locale)}</Text>
          </Banner>
          {inputRates.map((r) => (
            <Box key={`in-${r.label}`}>
              <Card
                title={r.label}
                value={`${formatNumber(r.total)} ${r.currency}`}
                description={r.rate.exchanger_name}
                extra={r.rate.trust_status_label || ''}
              />
              <Link href={buildUrl(r.tokenSlug, r.fiatSlug)}>
                {t('checkRate', locale)}
              </Link>
            </Box>
          ))}
        </Section>
      )}

      <Divider />
      <Box center>
        <Link href={`https://kurslog.com/${inputSlug}-to-visa-mastercard-uah`}>
          {t('findBestRate', locale)} {tokenName}
        </Link>
      </Box>
    </Box>
  );

  return { content };
};
