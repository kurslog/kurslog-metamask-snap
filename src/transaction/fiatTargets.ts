export interface FiatTarget {
  slug: string;
  needsCity: boolean;
  label: string;
  currency: string;
}

/** Country URL → fiat cash-out targets */
const COUNTRY_FIAT_TARGETS: Record<string, FiatTarget[]> = {
  ukraine: [
    { slug: 'visa-mastercard-uah', needsCity: false, label: 'Card UAH', currency: 'UAH' },
    { slug: 'cash-uah', needsCity: true, label: 'Cash UAH', currency: 'UAH' },
    { slug: 'cash-usd', needsCity: true, label: 'Cash USD', currency: 'USD' },
  ],
  poland: [
    { slug: 'visa-mastercard-pln', needsCity: false, label: 'Card PLN', currency: 'PLN' },
    { slug: 'cash-pln', needsCity: true, label: 'Cash PLN', currency: 'PLN' },
    { slug: 'cash-usd', needsCity: true, label: 'Cash USD', currency: 'USD' },
  ],
  georgia: [
    { slug: 'visa-mastercard-gel', needsCity: false, label: 'Card GEL', currency: 'GEL' },
    { slug: 'cash-gel', needsCity: true, label: 'Cash GEL', currency: 'GEL' },
    { slug: 'cash-usd', needsCity: true, label: 'Cash USD', currency: 'USD' },
  ],
  turkey: [
    { slug: 'visa-mastercard-try', needsCity: false, label: 'Card TRY', currency: 'TRY' },
    { slug: 'cash-try', needsCity: true, label: 'Cash TRY', currency: 'TRY' },
    { slug: 'cash-usd', needsCity: true, label: 'Cash USD', currency: 'USD' },
  ],
};

const DEFAULT_TARGETS: FiatTarget[] = [
  { slug: 'cash-usd', needsCity: true, label: 'Cash USD', currency: 'USD' },
];

export function getFiatTargets(countryUrl: string): FiatTarget[] {
  return COUNTRY_FIAT_TARGETS[countryUrl] || DEFAULT_TARGETS;
}
