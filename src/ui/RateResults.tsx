import {
  Box,
  Heading,
  Text,
  Bold,
  Section,
  Card,
  Link,
  Banner,
  Divider,
} from '@metamask/snaps-sdk/jsx';
import type { RateItem } from '../api/types';
import { formatRate } from '../utils/format';
import { t } from '../utils/i18n';

export function RateResultsUI({
  rates,
  from,
  to,
  locale,
  cityUrl,
}: {
  rates: RateItem[];
  from: string;
  to: string;
  locale: string;
  cityUrl?: string;
}) {
  const fromUpper = from.toUpperCase().split('-')[0];
  const toUpper = to.toUpperCase().split('-')[0];
  const needsCity = to.includes('cash-');
  const cityPart = needsCity && cityUrl ? `-in-${cityUrl}` : '';
  const directionUrl = `https://kurslog.com/${from}-to-${to}${cityPart}`;

  if (rates.length === 0) {
    return (
      <Box>
        <Heading size="lg">{fromUpper} → {toUpper}</Heading>
        <Banner title={t('noRates', locale)} severity="warning">
          <Text>
            <Link href={directionUrl}>
              kurslog.com →
            </Link>
          </Text>
        </Banner>
      </Box>
    );
  }

  const bestRate = rates[0];
  const bestRateValue = formatRate(bestRate.rate_in, bestRate.rate_out);

  return (
    <Box>
      <Heading size="lg">{fromUpper} → {toUpper}</Heading>

      <Banner title={`${t('bestRate', locale)}: ${bestRateValue}`} severity="success">
        <Text>
          {bestRate.exchanger_name}
          {bestRate.trust_status_label ? ` · ${bestRate.trust_status_label}` : ''}
        </Text>
      </Banner>

      <Section>
        {rates.map((rate, i) => (
          <Card
            key={`r-${rate.exchanger_id}`}
            title={`#${i + 1} ${rate.exchanger_name}`}
            value={formatRate(rate.rate_in, rate.rate_out)}
            description={rate.trust_status_label || ''}
            extra={rate.exchanger_trust_score_total ? `${t('trust', locale)}: ${rate.exchanger_trust_score_total}` : ''}
          />
        ))}
      </Section>

      <Divider />
      <Box center>
        <Link href={directionUrl}>
          <Bold>{t('checkRate', locale)}</Bold> kurslog.com →
        </Link>
      </Box>
    </Box>
  );
}
