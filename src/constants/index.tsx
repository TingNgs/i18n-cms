export const FLATTEN_FILE_TYPE = ['json_flatten', 'yaml_flatten'] as const;

export const FILE_TYPE = ['json', 'yaml', ...FLATTEN_FILE_TYPE] as const;

export const REPOSITORY_VISIBILITY = ['public', 'private'] as const;

export const FILE_TYPE_MAP_DATA: {
  [key in typeof FILE_TYPE[number]]: { ext: string; label: string };
} = {
  json: { ext: 'json', label: 'JSON' },
  yaml: { ext: 'yaml', label: 'YAML' },
  json_flatten: { ext: 'json', label: 'JSON (flatten)' },
  yaml_flatten: { ext: 'yaml', label: 'YAML (flatten)' }
};

export const CONFIG_FOLDER = '.i18n-cms' as const;
export const CONFIG_PATH = `${CONFIG_FOLDER}/config.json` as const;
export const CUSTOM_PATH_HANDLER_PATH =
  `${CONFIG_FOLDER}/getCustomPath.js` as const;

export const RECENT_BRANCHES_SIZE = 5;

export const CELL_HEIGHT = 60;
