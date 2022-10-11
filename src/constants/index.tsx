export const LOCALES_FILE_STRUCTURE = [
  'locales/{lng}/{ns}',
  'locales/{ns}/{lng}'
] as const;
export const LOCALES_FILE_TYPE = ['json', 'js', 'ts'] as const;
export const REPOSITORY_VISIBILITY = ['public', 'private'] as const;

export const CONFIG_PATH = '.i18n-cms/config.json' as const;
export const RECENT_BRANCHES_SIZE = 5;

export const CELL_HEIGHT = 60;
