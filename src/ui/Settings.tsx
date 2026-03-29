import {
  Box,
  Heading,
  Text,
  Form,
  Dropdown,
  Option,
  Button,
  Section,
  Divider,
} from '@metamask/snaps-sdk/jsx';
import { fetchCountries, fetchCities } from '../api/client';
import { getState } from '../state/manager';
import { getLocaleName, t } from '../utils/i18n';
import { getCityName, getCountryName } from '../utils/locationNames';

/**
 * Settings main screen — shows current values with "Change" button
 */
export async function renderSettings() {
  const state = await getState();
  const { locale, countryUrl, cityUrl } = state.settings;
  const cityName = getCityName(cityUrl, locale);
  const countryName = getCountryName(countryUrl, locale);

  const langLabel = locale === 'uk' ? 'Українська' : locale === 'ru' ? 'Русский' : 'English';

  return (
    <Box>
      <Heading size="lg">{t('settings', locale)}</Heading>

      <Section>
        <Box direction="horizontal" alignment="space-between">
          <Text>{t('language', locale)}: {langLabel}</Text>
          <Button name="editLanguage">{t('change', locale)}</Button>
        </Box>
      </Section>

      <Section>
        <Box direction="horizontal" alignment="space-between">
          <Text>{cityName}, {countryName}</Text>
          <Button name="editLocation">{t('change', locale)}</Button>
        </Box>
      </Section>

      <Divider />
      <Button name="backHome">Home</Button>
    </Box>
  );
}

/**
 * Language picker form
 */
export async function renderLanguageSettings() {
  const state = await getState();
  const { locale } = state.settings;

  return (
    <Box>
      <Heading size="lg">{t('language', locale)}</Heading>

      <Section>
        <Form name="saveLanguage">
          <Dropdown name="locale" value={locale}>
            <Option value="uk">Українська</Option>
            <Option value="ru">Русский</Option>
            <Option value="en">English</Option>
          </Dropdown>
          <Button type="submit">{t('save', locale)}</Button>
        </Form>
      </Section>

      <Button name="openSettings">{t('back', locale)}</Button>
    </Box>
  );
}

/**
 * Location step 1: Country picker
 */
export async function renderCountrySettings() {
  const state = await getState();
  const { locale, countryUrl } = state.settings;

  let countries: Array<{ url: string; name_uk: string; name_ru: string; name_en: string }> = [];
  try {
    countries = await fetchCountries(locale);
  } catch { /* fallback */ }

  return (
    <Box>
      <Heading size="lg">{t('selectCountry', locale)}</Heading>

      <Section>
        <Form name="saveCountry">
          <Dropdown name="country" value={countryUrl}>
            {countries.length > 0 ? (
              countries.map((c) => (
                <Option value={c.url} key={c.url}>
                  {getLocaleName(c, locale)}
                </Option>
              ))
            ) : (
              <Option value="ukraine">Ukraine</Option>
            )}
          </Dropdown>
          <Button type="submit">{t('next', locale)}</Button>
        </Form>
      </Section>

      <Button name="openSettings">{t('back', locale)}</Button>
    </Box>
  );
}

/**
 * Location step 2: City picker (for selected country)
 */
export async function renderCitySettings(countryUrl: string, locale: string) {
  const countryName = getCountryName(countryUrl, locale);

  let cities: Array<{ url: string; name_uk: string; name_ru: string; name_en: string }> = [];
  try {
    cities = await fetchCities(countryUrl, locale);
  } catch { /* fallback */ }

  return (
    <Box>
      <Heading size="lg">{t('selectCity', locale)}</Heading>
      <Text>{countryName}</Text>

      <Section>
        <Form name="saveCity">
          <Dropdown name="city" value={cities[0]?.url || 'kyiv'}>
            {cities.length > 0 ? (
              cities.map((c) => (
                <Option value={c.url} key={c.url}>
                  {getLocaleName(c, locale)}
                </Option>
              ))
            ) : (
              <Option value="kyiv">Kyiv</Option>
            )}
          </Dropdown>
          <Button type="submit">{t('save', locale)}</Button>
        </Form>
      </Section>

      <Button name="editLocation">{t('back', locale)}</Button>
    </Box>
  );
}
