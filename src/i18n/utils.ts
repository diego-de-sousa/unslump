import en from './locales/en.json';
import es from './locales/es.json';

export const languages = {
  en: 'English',
  es: 'Español',
};

export const defaultLang = 'en';

export const ui = {
  en,
  es,
} as const;

export type Language = keyof typeof ui;

export type TranslationVariables = Record<string, string | number>;

export function getLangFromUrl(url: URL): Language {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as Language;
  return defaultLang;
}

export function useTranslations(lang: Language) {
  return function t(key: string): string {
    const keys = key.split('.');
    let value: any = ui[lang];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    return value || key;
  };
}

export function formatTranslation(
  lang: Language,
  key: string,
  variables: TranslationVariables = {},
): string {
  const value = useTranslations(lang)(key);

  return Object.entries(variables).reduce(
    (translation, [name, replacement]) =>
      translation.replaceAll(`{${name}}`, String(replacement)),
    value,
  );
}

export function getLocalizedUrl(url: string, lang: Language): string {
  return `/${lang}${url}`;
}
