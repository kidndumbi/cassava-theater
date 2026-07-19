/** Supported language codes */
export type LanguageCode = 'en' | 'es' | 'fr';

/** All supported language codes */
export const SUPPORTED_LANGUAGES: readonly LanguageCode[] = ['en', 'es', 'fr'] as const;

/** Human-readable display names for each language */
export const LANGUAGE_DISPLAY_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
};

/** Get the display name for a language code, with an optional fallback */
export function getLanguageDisplayName(code: LanguageCode | null): string {
  return code ? LANGUAGE_DISPLAY_NAMES[code] : 'Language Learning';
}

/** Check if a string is a supported language code */
export function isLanguageCode(value: string): value is LanguageCode {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}