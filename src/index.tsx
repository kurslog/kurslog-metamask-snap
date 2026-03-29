import type {
  OnInstallHandler,
  OnHomePageHandler,
  OnTransactionHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { UserInputEventType } from '@metamask/snaps-sdk';
import { Box, Heading, Button, Divider, Text, Banner } from '@metamask/snaps-sdk/jsx';

import { onTransaction as transactionHandler } from './transaction/insight';
import { renderHomePage } from './ui/HomePage';
import { renderSettings, renderLanguageSettings, renderCountrySettings, renderCitySettings } from './ui/Settings';
import {
  renderFromTagPicker,
  renderFromCurrencyPicker,
  renderToTagPicker,
  renderToCurrencyPicker,
} from './ui/CheckRateForm';
import { RateResultsUI } from './ui/RateResults';
import { updateState, getState } from './state/manager';
import { fetchTopRates, fetchCurrenciesForSnap } from './api/client';
import { DEFAULT_STATE } from './state/schema';
import { t } from './utils/i18n';

export const onTransaction: OnTransactionHandler = transactionHandler;

// Detect MetaMask locale and map to our supported locales
async function detectLocale(): Promise<'uk' | 'ru' | 'en'> {
  try {
    const prefs = await snap.request({ method: 'snap_getPreferences' }) as any;
    const mmLocale = (prefs?.locale || '').toLowerCase();
    if (mmLocale.startsWith('uk')) return 'uk';
    if (mmLocale.startsWith('ru')) return 'ru';
    return 'en';
  } catch {
    return 'uk';
  }
}

export const onInstall: OnInstallHandler = async () => {
  const locale = await detectLocale();
  const state = { ...DEFAULT_STATE };
  state.settings.locale = locale;
  await updateState(state);
  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: (
        <Box>
          <Heading size="lg">{t('welcome', locale)}</Heading>
          <Text>{t('welcomeDesc', locale)}</Text>
          <Divider />
          <Text>{t('defaultLocation', locale)}</Text>
          <Text>{t('changeInSettings', locale)}</Text>
          <Divider />
          <Text>kurslog.com</Text>
        </Box>
      ),
    },
  });
};

export const onHomePage: OnHomePageHandler = async () => {
  try {
    const content = await renderHomePage();
    return { content };
  } catch {
    return {
      content: (
        <Box>
          <Heading>Kurslog</Heading>
          <Banner title="Error loading data" severity="danger">
            <Text>Check your internet connection and try again.</Text>
          </Banner>
          <Button name="checkRate">Check rate</Button>
          <Button name="openSettings">Settings</Button>
        </Box>
      ),
    };
  }
};

// Helper: get currency name by slug
async function getCurrencyName(slug: string, locale: string): Promise<string> {
  try {
    const all = await fetchCurrenciesForSnap();
    const found = all.find((c) => c.url === slug);
    if (!found) return slug;
    if (locale === 'uk') return found.name_uk || found.name_en;
    if (locale === 'ru') return found.name_ru || found.name_en;
    return found.name_en || slug;
  } catch {
    return slug;
  }
}

export const onUserInput: OnUserInputHandler = async ({ id, event }) => {
  // === FORM SUBMISSIONS ===
  if (event.type === UserInputEventType.FormSubmitEvent) {
    const state = await getState();
    const vals = event.value as Record<string, string>;

    // Save language
    if (event.name === 'saveLanguage') {
      if (vals.locale) state.settings.locale = vals.locale as 'uk' | 'ru' | 'en';
      await updateState(state);
      const ui = await renderSettings();
      await snap.request({ method: 'snap_updateInterface', params: { id, ui } });
      return;
    }

    // Save country → go to city picker
    if (event.name === 'saveCountry') {
      if (vals.country) state.settings.countryUrl = vals.country;
      await updateState(state);
      const ui = await renderCitySettings(state.settings.countryUrl, state.settings.locale);
      await snap.request({ method: 'snap_updateInterface', params: { id, ui } });
      return;
    }

    // Save city → back to settings
    if (event.name === 'saveCity') {
      if (vals.city) state.settings.cityUrl = vals.city;
      await updateState(state);
      const ui = await renderSettings();
      await snap.request({ method: 'snap_updateInterface', params: { id, ui } });
      return;
    }

    // === CHECK RATE MULTI-STEP FLOW ===

    // Step 1 → 2: from tag selected, show from currencies
    if (event.name === 'pickFromTag') {
      const fromTag = vals.fromTag;
      state.pendingCheck = { fromTag };
      await updateState(state);
      const ui = await renderFromCurrencyPicker(fromTag);
      await snap.request({ method: 'snap_updateInterface', params: { id, ui } });
      return;
    }

    // Step 2 → 3: from currency selected, show to tag picker
    if (event.name === 'pickFromCurrency') {
      const fromSlug = vals.fromCurrency;
      const fromName = await getCurrencyName(fromSlug, state.settings.locale);
      state.pendingCheck = { ...state.pendingCheck, fromSlug, fromName };
      await updateState(state);
      const ui = await renderToTagPicker(fromSlug, fromName);
      await snap.request({ method: 'snap_updateInterface', params: { id, ui } });
      return;
    }

    // Step 3 → 4: to tag selected, show to currencies
    if (event.name === 'pickToTag') {
      const toTag = vals.toTag;
      const fromSlug = state.pendingCheck?.fromSlug || '';
      const fromName = state.pendingCheck?.fromName || fromSlug;
      state.pendingCheck = { ...state.pendingCheck, toTag };
      await updateState(state);
      const ui = await renderToCurrencyPicker(fromSlug, fromName, toTag);
      await snap.request({ method: 'snap_updateInterface', params: { id, ui } });
      return;
    }

    // Step 4 → results: to currency selected, fetch and show rates
    if (event.name === 'pickToCurrency') {
      const toSlug = vals.toCurrency;
      const fromSlug = state.pendingCheck?.fromSlug || '';
      const { locale, cityUrl } = state.settings;
      const needsCity = toSlug.includes('cash-');
      state.pendingCheck = undefined;
      await updateState(state);

      try {
        const data = await fetchTopRates(fromSlug, toSlug, 5, needsCity ? cityUrl : null, locale);
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: (
              <Box>
                <RateResultsUI rates={data.rates} from={fromSlug} to={toSlug} locale={locale} cityUrl={state.settings.cityUrl} />
                <Divider />
                <Button name="checkRate">{t('checkRate', locale)}</Button>
                <Button name="backHome">Home</Button>
              </Box>
            ),
          },
        });
      } catch {
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: (
              <Box>
                <Banner title="Error" severity="danger">
                  <Text>Failed to fetch rates. Try again.</Text>
                </Banner>
                <Button name="checkRate">{t('checkRate', locale)}</Button>
                <Button name="backHome">Home</Button>
              </Box>
            ),
          },
        });
      }
      return;
    }

  }

  // === BUTTON CLICKS ===
  if (event.type === UserInputEventType.ButtonClickEvent) {
    const name = event.name || '';

    if (name === 'checkRate') {
      const ui = await renderFromTagPicker();
      await snap.request({ method: 'snap_updateInterface', params: { id, ui } });
      return;
    }

    if (name === 'openSettings') {
      const ui = await renderSettings();
      await snap.request({ method: 'snap_updateInterface', params: { id, ui } });
      return;
    }

    if (name === 'editLanguage') {
      const ui = await renderLanguageSettings();
      await snap.request({ method: 'snap_updateInterface', params: { id, ui } });
      return;
    }

    if (name === 'editLocation') {
      const ui = await renderCountrySettings();
      await snap.request({ method: 'snap_updateInterface', params: { id, ui } });
      return;
    }

    if (name === 'backHome') {
      const ui = await renderHomePage();
      await snap.request({ method: 'snap_updateInterface', params: { id, ui } });
      return;
    }

  }
};
