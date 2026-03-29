import {
  Box,
  Heading,
  Text,
  Button,
  Section,
  Card,
  Link,
  Divider,
  Banner,
} from '@metamask/snaps-sdk/jsx';
import { fetchPopularDirections } from '../api/client';
import { getState } from '../state/manager';
import { formatRate } from '../utils/format';
import { t } from '../utils/i18n';
import { getCityName, getCountryName } from '../utils/locationNames';

export async function renderHomePage() {
  const state = await getState();
  const { locale, countryUrl, cityUrl } = state.settings;
  const cityName = getCityName(cityUrl, locale);
  const countryName = getCountryName(countryUrl, locale);

  // Fetch popular directions deduplicated
  let popularCards: Array<{
    fromName: string; toName: string; fromSlug: string; toSlug: string; rateStr: string;
  }> = [];
  try {
    const popular = await fetchPopularDirections(50, null, locale);
    const seen = new Set<string>();
    for (const d of popular) {
      const key = `${d.from_currency}-${d.to_currency}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const fromNameKey = `from_name_${locale}` as keyof typeof d;
      const toNameKey = `to_name_${locale}` as keyof typeof d;
      popularCards.push({
        fromName: (d[fromNameKey] as string) || d.from_name_en || d.from_currency,
        toName: (d[toNameKey] as string) || d.to_name_en || d.to_currency,
        fromSlug: d.from_currency,
        toSlug: d.to_currency,
        rateStr: d.rate_out && d.rate_in ? formatRate(d.rate_in, d.rate_out) : '—',
      });
      if (popularCards.length >= 6) break;
    }
  } catch {
    // ignore
  }

  return (
    <Box>
      <Section>
        <Box direction="horizontal" alignment="space-between">
          <Heading size="lg">Kurslog</Heading>
          <Button name="openSettings">{t('settings', locale)}</Button>
        </Box>
        <Text>{cityName}, {countryName}</Text>
      </Section>

      <Section>
        <Heading size="md">{t('popular', locale)}</Heading>
        {popularCards.length > 0 ? (
          popularCards.map((p) => (
            <Card
              key={`p-${p.fromSlug}-${p.toSlug}`}
              title={`${p.fromName} → ${p.toName}`}
              value={p.rateStr}
            />
          ))
        ) : (
          <Banner title={t('noRates', locale)} severity="warning">
            <Text>{t('selectCity', locale)}</Text>
          </Banner>
        )}
      </Section>

      <Divider />
      <Button name="checkRate">{t('checkRate', locale)}</Button>

      <Divider />
      <Box center>
        <Link href="https://kurslog.com">kurslog.com</Link>
      </Box>
    </Box>
  );
}
