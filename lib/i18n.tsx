'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'tpi'; // English | Tok Pisin

// ─── Translation Dictionary ───────────────────────────────────────────────────
const translations: Record<string, Record<Language, string>> = {
  // Nav
  'nav.dashboard': { en: 'Market Prices', tpi: 'Prais Bilong Maket' },
  'nav.board': { en: 'Transport Board', tpi: 'Bodi Bilong PMV' },
  'nav.offline': { en: 'Offline', tpi: 'Nogat Net' },

  // Dashboard
  'dashboard.title': { en: 'Live Market Prices', tpi: 'Prais Bilong Tude' },
  'dashboard.subtitle': { en: 'PNG Coffee & Cocoa — updated weekly', tpi: 'Kofi na Kokoa PNG — Apdetim Olgeta Wik' },
  'dashboard.coffee': { en: 'Coffee', tpi: 'Kofi' },
  'dashboard.cocoa': { en: 'Cocoa', tpi: 'Kokoa' },
  'dashboard.per_kg': { en: 'per kg', tpi: 'long wan kilo' },
  'dashboard.region': { en: 'Region', tpi: 'Ples' },
  'dashboard.source': { en: 'Source', tpi: 'Sosum' },
  'dashboard.change': { en: 'Weekly Change', tpi: 'Senis Long Wik' },
  'dashboard.last_updated': { en: 'Last Updated', tpi: 'Las Apdetim' },
  'dashboard.loading': { en: 'Fetching prices…', tpi: 'Lukautim prais…' },
  'dashboard.offline_notice': { en: 'Showing cached prices (offline)', tpi: 'Soim prais bipo (nogat net)' },
  'dashboard.no_data': { en: 'No price data available', tpi: 'Nogat prais istap' },

  // Transport Board
  'board.title': { en: 'Transport Board', tpi: 'Bodi Bilong PMV' },
  'board.subtitle': { en: 'Connect farmers with PMV drivers', tpi: 'Kamap wantaim diraiva bilong PMV' },
  'board.post_load': { en: 'Post a Load', tpi: 'Posim Lod' },
  'board.available_loads': { en: 'Available Loads', tpi: 'Lod Istap' },
  'board.farmer': { en: 'Farmer', tpi: 'Pama' },
  'board.driver': { en: 'Driver', tpi: 'Diraiva' },
  'board.pickup': { en: 'Pickup Location', tpi: 'Ples Pikap' },
  'board.destination': { en: 'Destination', tpi: 'Ples Bikpela' },
  'board.quantity': { en: 'Quantity (kg)', tpi: 'Hamas Kilo' },
  'board.date': { en: 'Pickup Date', tpi: 'De Bilong Pikap' },
  'board.price_offered': { en: 'Price Offered (PGK)', tpi: 'Prais Yu Ofim (Kina)' },
  'board.notes': { en: 'Notes', tpi: 'Tok Moa' },
  'board.phone': { en: 'Phone Number', tpi: 'Namba Fon' },
  'board.province': { en: 'Province', tpi: 'Provins' },
  'board.village': { en: 'Village', tpi: 'Ples' },
  'board.commodity': { en: 'Commodity', tpi: 'Samting' },
  'board.status.open': { en: 'Open', tpi: 'Opim' },
  'board.status.matched': { en: 'Matched', tpi: 'Painim Diraiva' },
  'board.status.completed': { en: 'Completed', tpi: 'Pinis' },
  'board.contact_driver': { en: 'Contact Driver', tpi: 'Ringim Diraiva' },
  'board.contact_farmer': { en: 'Contact Farmer', tpi: 'Ringim Pama' },
  'board.submit': { en: 'Post Load', tpi: 'Posim Nau' },
  'board.cancel': { en: 'Cancel', tpi: 'Bek' },
  'board.loading': { en: 'Loading board…', tpi: 'Lukautim bodi…' },
  'board.empty': { en: 'No loads posted yet', tpi: 'Nogat lod istap yet' },
  'board.name': { en: 'Your Name', tpi: 'Nem Bilong Yu' },
  'board.success': { en: 'Load posted successfully!', tpi: 'Posim lod pinis!' },
  'board.error': { en: 'Failed to post. Try again.', tpi: 'Bagarap. Traim Gen.' },
  'board.filter_all': { en: 'All Loads', tpi: 'Olgeta Lod' },
  'board.filter_coffee': { en: 'Coffee Only', tpi: 'Kofi Tasol' },
  'board.filter_cocoa': { en: 'Cocoa Only', tpi: 'Kokoa Tasol' },

  // Common
  'common.kina': { en: 'PGK', tpi: 'Kina' },
  'common.kg': { en: 'kg', tpi: 'kilo' },
  'common.usd': { en: 'USD', tpi: 'USD' },
  'common.error': { en: 'Something went wrong', tpi: 'Samting bagarap' },
  'common.retry': { en: 'Retry', tpi: 'Traim Gen' },
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface I18nContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? translations[key]?.['en'] ?? key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
