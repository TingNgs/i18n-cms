import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import { Octokit } from 'octokit';
import { CONFIG_PATH } from '../constants';
import { RepoConfig } from '../redux/editingRepoSlice';
const octokit = new Octokit();

const dataToJson = (data: { [key: string]: string }) => {
  return JSON.stringify(data, null, 2);
};

const dataToJsOrTs = (data: { [key: string]: string }, language: string) => {
  return `const ${language} = ${dataToJson(
    data
  )}; \n\nexport default ${language};`;
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
  const { fileStructure, fileType, basePath } = repoConfig;
  const files: { [path: string]: string } = {
    [CONFIG_PATH]: dataToJson({ fileStructure, fileType, basePath })
  };

  namespaces.forEach((namespace) => {
    languages.forEach((language) => {
      const filePath = fileStructure
        .replace('{lng}', language)
        .replace('{ns}', namespace)
        .concat(`.${fileType}`);

      const fullPath = `${basePath ? `${basePath}/` : ''}${filePath}`;
      const translation = data?.[namespace]?.[language] || { hi: 'hi' };
      files[fullPath] =
        fileType === 'json'
          ? dataToJson(translation)
          : dataToJsOrTs(translation, language);
    });
  });
  return files;
};

export const decodeGithubFileContent = (
  file: GetResponseDataTypeFromEndpointMethod<
    typeof octokit.rest.repos.getContent
  >
) => {
  if (typeof file === 'object' && 'type' in file && file.type === 'file') {
    return Buffer.from(file.content, 'base64').toString();
  }
  throw new Error('not file');
};

export const decodeConfigFile = (
  file: GetResponseDataTypeFromEndpointMethod<
    typeof octokit.rest.repos.getContent
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