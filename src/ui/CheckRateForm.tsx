import {
  Box,
  Heading,
  Text,
  Form,
  Dropdown,
  Option,
  Button,
  Section,
} from '@metamask/snaps-sdk/jsx';
import { fetchCurrenciesForSnap, type CurrencyItem } from '../api/client';
import { getState } from '../state/manager';
import { t } from '../utils/i18n';

const TAG_ORDER = ['Crypto', 'USDT', 'USDC', 'UAH', 'USD', 'EUR', 'PLN', 'KZT', 'CNY', 'Cash'];

function getLabel(c: CurrencyItem, locale: string): string {
  if (locale === 'uk') return c.name_uk || c.name_en || c.url;
  if (locale === 'ru') return c.name_ru || c.name_en || c.url;
  return c.name_en || c.url;
}

function groupByTags(currencies: CurrencyItem[]): Record<string, CurrencyItem[]> {
  const groups: Record<string, CurrencyItem[]> = {};
  for (const c of currencies) {
    const tagNames = c.tags?.map((t) => t.name_en) || [];
    for (const tag of tagNames) {
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(c);
    }
    if (tagNames.length === 0) {
      if (!groups['Other']) groups['Other'] = [];
      groups['Other'].push(c);
    }
  }
  return groups;
}

export async function renderFromTagPicker() {
  const state = await getState();
  const { locale } = state.settings;

  return (
    <Box>
      <Heading size="lg">{t('checkRate', locale)}</Heading>

      <Section>
        <Text>{t('selectFromCategory', locale)}</Text>
        <Form name="pickFromTag">
          <Dropdown name="fromTag" value="Crypto">
            {TAG_ORDER.map((tag) => (
              <Option value={tag} key={tag}>{tag}</Option>
            ))}
          </Dropdown>
          <Button type="submit">{t('next', locale)}</Button>
        </Form>
      </Section>

      <Button name="backHome">Home</Button>
    </Box>
  );
}

export async function renderFromCurrencyPicker(tag: string) {
  const state = await getState();
  const { locale } = state.settings;

  let currencies: CurrencyItem[] = [];
  try {
    const all = await fetchCurrenciesForSnap();
    const groups = groupByTags(all);
    currencies = groups[tag] || [];
  } catch { /* fallback */ }

  return (
    <Box>
      <Heading size="lg">{t('checkRate', locale)}</Heading>
      <Text>{t('from', locale)}: {tag}</Text>

      <Section>
        <Text>{t('selectCurrency', locale)}</Text>
        <Form name="pickFromCurrency">
          <Dropdown name="fromCurrency" value={currencies[0]?.url || ''}>
            {currencies.map((c) => (
              <Option value={c.url} key={c.url}>{getLabel(c, locale)}</Option>
            ))}
          </Dropdown>
          <Button type="submit">{t('next', locale)}</Button>
        </Form>
      </Section>

      <Button name="checkRate">{t('back', locale)}</Button>
    </Box>
  );
}

export async function renderToTagPicker(fromSlug: string, fromName: string) {
  const state = await getState();
  const { locale } = state.settings;

  return (
    <Box>
      <Heading size="lg">{t('checkRate', locale)}</Heading>
      <Text>{t('from', locale)}: {fromName}</Text>

      <Section>
        <Text>{t('selectToCategory', locale)}</Text>
        <Form name="pickToTag">
          <Dropdown name="toTag" value="UAH">
            {TAG_ORDER.map((tag) => (
              <Option value={tag} key={tag}>{tag}</Option>
            ))}
          </Dropdown>
          <Button type="submit">{t('next', locale)}</Button>
        </Form>
      </Section>

      <Button name="checkRate">{t('back', locale)}</Button>
    </Box>
  );
}

export async function renderToCurrencyPicker(
  fromSlug: string,
  fromName: string,
  toTag: string,
) {
  const state = await getState();
  const { locale } = state.settings;

  let currencies: CurrencyItem[] = [];
  try {
    const all = await fetchCurrenciesForSnap();
    const groups = groupByTags(all);
    currencies = groups[toTag] || [];
  } catch { /* fallback */ }

  return (
    <Box>
      <Heading size="lg">{t('checkRate', locale)}</Heading>
      <Text>{t('from', locale)}: {fromName}</Text>
      <Text>{t('to', locale)}: {toTag}</Text>

      <Section>
        <Text>{t('selectCurrency', locale)}</Text>
        <Form name="pickToCurrency">
          <Dropdown name="toCurrency" value={currencies[0]?.url || ''}>
            {currencies.map((c) => (
              <Option value={c.url} key={c.url}>{getLabel(c, locale)}</Option>
            ))}
          </Dropdown>
          <Button type="submit">{t('checkRate', locale)}</Button>
        </Form>
      </Section>

      <Button name="checkRate">{t('back', locale)}</Button>
    </Box>
  );
}
