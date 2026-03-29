export interface SnapState {
  version: 1;
  settings: {
    locale: 'uk' | 'ru' | 'en';
    countryUrl: string;
    cityUrl: string;
  };
  pendingCheck?: {
    fromSlug?: string;
    fromName?: string;
    fromTag?: string;
    toTag?: string;
  };
}

export const DEFAULT_STATE: SnapState = {
  version: 1,
  settings: {
    locale: 'uk',
    countryUrl: 'ukraine',
    cityUrl: 'kyiv',
  },
};
