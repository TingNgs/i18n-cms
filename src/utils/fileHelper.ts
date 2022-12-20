import YAML from 'yaml';

import { CONFIG_PATH, FILE_TYPE_MAP_DATA } from '../constants';
import { RepoConfig } from '../redux/editingRepoSlice';
import { unflatten } from 'flat';

const dataToJson = (data: Record<string, unknown>) => {
  return JSON.stringify(data, null, 2);
};

const dataToYaml = (data: Record<string, unknown>) => {
  return YAML.stringify(data);
};

const jsonToData = (json?: string) => JSON.parse(json || '{}');
const yamlToData = (yaml?: string) => YAML.parse(yaml || '{}');

export const dataStringifyByType = {
  json: (data: Record<string, unknown>) => dataToJson(unflatten(data)),
  yaml: (data: Record<string, unknown>) => dataToYaml(unflatten(data)),
  json_flatten: dataToJson,
  yaml_flatten: dataToYaml,
  md: (value: string) => value
};

export const fileParseByType = {
  json: jsonToData,
  yaml: yamlToData,
  json_flatten: jsonToData,
  yaml_flatten: yamlToData,
  md: (value?: string) => value || ''
};

export const getLocalePath = async ({
  language,
  namespace,
  repoConfig
}: {
  language: string;
  namespace: string;
  repoConfig: RepoConfig;
}) => {
  const { fileType, pattern, targetPattern, useCustomPath } = repoConfig;
  if (useCustomPath && window.getCustomPath)
    return window.getCustomPath({ namespace, language, repoConfig });

  const fullPath = (
    language !== repoConfig.defaultLanguage && targetPattern
      ? targetPattern
      : pattern
  )
    .replace(':lng', language)
    .replace(':ns', namespace)
    .concat(`.${FILE_TYPE_MAP_DATA[fileType].ext}`);

  return fullPath;
};

export const dataToFiles = async ({
  namespaces,
  data,
  repoConfig
}: {
  namespaces: string[];
  data?: {
    [namespace: string]: { [language: string]: { [key: string]: string } };
  };
  repoConfig: RepoConfig;
}) => {
  const files: { [path: string]: string } = {
    [CONFIG_PATH]: dataToJson(repoConfig as unknown as Record<string, unknown>)
  };

  for (const namespace of namespaces) {
    for (const language of repoConfig.languages) {
      switch (repoConfig.fileType) {
        case 'md': {
          break;
        }
        default: {
          const translation = data ? data[namespace]?.[language] : { hi: 'hi' };
          if (!translation) continue;
          const path = await getLocalePath({ language, namespace, repoConfig });
          files[path] = dataStringifyByType[repoConfig.fileType](translation);
        }
      }
    }
  }
  return files;
};

export const decodeConfigFile = (data: string) => {
  const config = JSON.parse(data);
  return config;
};
