export interface RateItem {
  id: number;
  direction_id: number;
  rate_in: number;
  rate_out: number;
  reserves: number | null;
  min_amount: number | null;
  max_amount: number | null;
  from_currency: string;
  to_currency: string;
  from_currency_name: string;
  to_currency_name: string;
  from_currency_decimals: number;
  to_currency_decimals: number;
  exchanger_id: number;
  exchanger_name: string;
  exchanger_rating: number | null;
  exchanger_internal_url: string;
  exchanger_trust_score_total: number | null;
  trust_status_label: string | null;
}

export interface TopRatesResponse {
  rates: RateItem[];
}

export interface DirectionExistsResponse {
  exists: boolean;
}

export interface PopularDirection {
  id: number;
  from_currency: string;
  to_currency: string;
  from_name_uk: string;
  from_name_ru: string;
  from_name_en: string;
  to_name_uk: string;
  to_name_ru: string;
  to_name_en: string;
  from_currency_name: string;
  to_currency_name: string;
  rate_in: number;
  rate_out: number;
}

export interface Country {
  id: number;
  code: string;
  name_uk: string;
  name_ru: string;
  name_en: string;
  url: string;
}

export interface City {
  id: number;
  name_uk: string;
  name_ru: string;
  name_en: string;
  url: string;
  popularity: number;
}
