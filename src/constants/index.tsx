export const LOCALES_FILE_STRUCTURE = ['{lng}/{ns}', '{ns}/{lng}'] as const;
export const LOCALES_FILE_TYPE = ['json', 'js', 'ts'] as const;
export const REPOSITORY_VISIBILITY = ['public', 'private'] as const;

export const CONFIG_FOLDER = '.i18n-cms' as const;
export const CONFIG_PATH = `${CONFIG_FOLDER}/config.json` as const;
export const RECENT_BRANCHES_SIZE = 5;

export const CELL_HEIGHT = 60;
