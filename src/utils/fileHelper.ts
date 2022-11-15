import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import { Octokit } from '@octokit/rest';
import YAML from 'yaml';

import { CONFIG_PATH, LOCALES_FILE_TYPE_MAP } from '../constants';
import { RepoConfig } from '../redux/editingRepoSlice';
import { unflatten } from 'flat';

const dataToJson = (data: Record<string, unknown>) => {
  return JSON.stringify(data, null, 2);
};

const dataToYaml = (data: Record<string, unknown>) => {
  return YAML.stringify(data);
};

const jsonToData = (json: string) => JSON.parse(json);
const yamlToData = (yaml: string) => YAML.parse(yaml);

export const dataStringifyByType = {
  json: (data: Record<string, unknown>) => dataToJson(unflatten(data)),
  yaml: (data: Record<string, unknown>) => dataToYaml(unflatten(data)),
  json_flatten: dataToJson,
  yaml_flatten: dataToYaml
};

export const fileParseByType = {
  json: jsonToData,
  yaml: yamlToData,
  json_flatten: jsonToData,
  yaml_flatten: yamlToData
};

export const getLocalePath = ({
  language,
  namespace,
  repoConfig
}: {
  language: string;
  namespace: string;
  repoConfig: RepoConfig;
}) => {
  const { fileType, pattern, useCustomPath } = repoConfig;

  const fullPath =
    useCustomPath && window.getCustomPath
      ? window.getCustomPath({ namespace, language, repoConfig })
      : pattern
          .replace(':lng', language)
          .replace(':ns', namespace)
          .concat(`.${LOCALES_FILE_TYPE_MAP[fileType].ext}`);

  return fullPath;
};

export const dataToFiles = ({
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

  namespaces.forEach((namespace) => {
    repoConfig.languages.forEach((language) => {
      const translation = data ? data[namespace]?.[language] : { hi: 'hi' };
      if (!translation) return;

      files[getLocalePath({ language, namespace, repoConfig })] =
        dataStringifyByType[repoConfig.fileType](translation);
    });
  });
  return files;
};

export const decodeGithubFileContent = (
  file: GetResponseDataTypeFromEndpointMethod<
    Octokit['rest']['repos']['getContent']
  >
) => {
  if (typeof file === 'object' && 'type' in file && file.type === 'file') {
    return Buffer.from(file.content, 'base64').toString();
  }
  throw new Error('not file');
};

export const decodeConfigFile = (data: string) => {
  const config = JSON.parse(data);
  return config;
};
