export const LOCALES_FILE_STRUCTURE = [
  'locales/{lng}/{ns}',
  'locales/{ns}/{lng}'
] as const;
export const LOCALES_FILE_TYPE = ['json', 'js', 'ts'] as const;
export const REPOSITORY_VISIBILITY = ['public', 'private'] as const;
