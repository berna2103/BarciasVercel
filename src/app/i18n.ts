// src/app/i18n.ts

import 'server-only'

// UPDATED: Removed 'pl'
type Locale = 'en' | 'es';

// Dictionary imports (lazy loading the JSON files)
// UPDATED: Removed pl: () => import('./dictionaries/pl.json')
const dictionaries: Record<Locale, () => Promise<any>> = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  es: () => import('./dictionaries/es.json').then((module) => module.default),
};

// Function to fetch the correct dictionary
export const getDictionary = async (locale: Locale) => {
  if (dictionaries[locale]) {
    return dictionaries[locale]();
  }
  // Default to English if locale is not found
  return dictionaries.en();
};