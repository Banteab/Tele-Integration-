export const LANGUAGES = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'am', label: 'አማርኛ', shortLabel: 'አማ' },
  { code: 'om', label: 'Afaan Oromoo', shortLabel: 'OR' },
  { code: 'ti', label: 'ትግርኛ', shortLabel: 'ትግ' },
  { code: 'so', label: 'Soomaali', shortLabel: 'SO' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export const SUPPORTED_LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

export function resolveLanguageCode(language?: string): LanguageCode {
  const base = language?.split('-')[0]?.toLowerCase() ?? 'en';
  const match = LANGUAGES.find((l) => l.code === base);
  return match?.code ?? 'en';
}
