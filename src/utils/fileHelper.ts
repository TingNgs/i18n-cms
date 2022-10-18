import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import { Octokit } from 'octokit/dist-types';

import { CONFIG_PATH } from '../constants';
import { RepoConfig } from '../redux/editingRepoSlice';

const dataToJson = (data: Record<string, unknown>) => {
  return JSON.stringify(data, null, 2);
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
  const { fileStructure, fileType, basePath, useCustomPath } = repoConfig;

  const filePath =
    useCustomPath && window.getCustomPath
      ? window.getCustomPath({ namespace, language, repoConfig })
      : fileStructure
          .replace('{lng}', language)
          .replace('{ns}', namespace)
          .concat(`.${fileType}`);

  const fullPath = `${basePath ? `${basePath}/` : ''}${filePath}`;
  return fullPath;
};

export const dataToFiles = ({
  languages,
  namespaces,
  data,
  repoConfig
}: {
  languages: string[];
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
    languages.forEach((language) => {
      const translation = data ? data[namespace]?.[language] : { hi: 'hi' };
      if (!translation) return;

      files[getLocalePath({ language, namespace, repoConfig })] =
        dataToJson(translation);
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

export const decodeConfigFile = (
  file: GetResponseDataTypeFromEndpointMethod<
    Octokit['rest']['repos']['getContent']
  >
) => {
  try {
    const decodedString = decodeGithubFileContent(file);
    const config = JSON.parse(decodedString);

    return config;
  } catch {
    return false;
  }
};
