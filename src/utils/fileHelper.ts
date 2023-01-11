import YAML from 'yaml';

import { CONFIG_PATH, FILE_TYPE_MAP_DATA } from '../constants';
import { RepoConfig } from '../redux/editingRepoSlice';
import { unflatten } from 'flat';
import { Files } from './GitApiWrapper/interface';

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
  repoConfig,
  configExist,
  originalLanguages = [],
  originalNamespaces = []
}: {
  namespaces: string[];
  repoConfig: RepoConfig;
  configExist: boolean;
  data?: {
    [namespace: string]: { [language: string]: { [key: string]: string } };
  };
  originalLanguages?: string[];
  originalNamespaces?: string[];
}) => {
  const files: Files = {
    [CONFIG_PATH]: {
      content: dataToJson(repoConfig as unknown as Record<string, unknown>),
      action: configExist ? 'update' : 'create'
    }
  };

  for (const namespace of namespaces) {
    for (const language of repoConfig.languages) {
      const path = await getLocalePath({ language, namespace, repoConfig });
      const action =
        originalLanguages.includes(language) &&
        originalNamespaces.includes(namespace)
          ? 'update'
          : 'create';
      switch (repoConfig.fileType) {
        case 'md': {
          break;
        }
        default: {
          const translation = data ? data[namespace]?.[language] : { hi: 'hi' };
          if (!translation) continue;
          files[path] = {
            action,
            content: dataStringifyByType[repoConfig.fileType](translation)
          };
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
