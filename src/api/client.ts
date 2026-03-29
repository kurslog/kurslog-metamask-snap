import type {
  TopRatesResponse,
  DirectionExistsResponse,
  PopularDirection,
  Country,
  City,
} from './types';

const API_BASE = 'https://kurslog.com/api/snap';

async function fetchJson<T>(url: string, locale = 'uk'): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Accept-Language': locale },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchTopRates(
  from: string,
  to: string,
  limit = 5,
  cityUrl?: string | null,
  locale = 'uk',
): Promise<TopRatesResponse> {
  let url = `${API_BASE}/rates/${encodeURIComponent(from)}-to-${encodeURIComponent(to)}/top?limit=${limit}`;
  if (cityUrl) {
    url += `&city_url=${encodeURIComponent(cityUrl)}`;
  }
  return fetchJson<TopRatesResponse>(url, locale);
}

export async function checkDirectionExists(
  from: string,
  to: string,
  cityUrl?: string | null,
): Promise<boolean> {
  let url = `${API_BASE}/rates/${encodeURIComponent(from)}-to-${encodeURIComponent(to)}/exists`;
  if (cityUrl) {
    url += `?city_url=${encodeURIComponent(cityUrl)}`;
  }
  const data = await fetchJson<DirectionExistsResponse>(url);
  return data.exists;
}

export async function fetchPopularDirections(
  limit = 10,
  countryUrl?: string | null,
  locale = 'uk',
): Promise<PopularDirection[]> {
  let url = `${API_BASE}/directions/popular?limit=${limit}`;
  if (countryUrl) {
    url += `&country_url=${encodeURIComponent(countryUrl)}`;
  }
  return fetchJson<PopularDirection[]>(url, locale);
}

export async function fetchCountries(locale = 'uk'): Promise<Country[]> {
  return fetchJson<Country[]>(`${API_BASE}/countries/list?locale=${locale}`);
}

export async function fetchCities(
  countryUrl: string,
  locale = 'uk',
): Promise<City[]> {
  return fetchJson<City[]>(
    `${API_BASE}/cities/by-country/${encodeURIComponent(countryUrl)}?locale=${encodeURIComponent(locale)}`,
  );
}

export interface CurrencyItem {
  url: string;
  name_uk: string;
  name_ru: string;
  name_en: string;
  currency_name: string;
  has_rates?: boolean;
  tags?: Array<{ name_en: string }>;
}

export async function fetchCurrenciesForSnap(): Promise<CurrencyItem[]> {
  return fetchJson<CurrencyItem[]>(`${API_BASE}/currencies/list`);
}
