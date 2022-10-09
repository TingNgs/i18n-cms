import { LOCALES_FILE_STRUCTURE, LOCALES_FILE_TYPE } from '../constants';

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
  fileStructure,
  fileType,
  basePath
}: {
  languages: string[];
  namespaces: string[];
  data?: {
    [namespace: string]: { [language: string]: { [key: string]: string } };
  };
  fileStructure: typeof LOCALES_FILE_STRUCTURE[number];
  fileType: typeof LOCALES_FILE_TYPE[number];
  basePath: string;
}) => {
  const files: { [path: string]: string } = {
    '.i18n-cms/config.json': dataToJson({ fileStructure, fileType, basePath })
  };

  namespaces.forEach((namespace) => {
    languages.forEach((language) => {
      const filePath = fileStructure
        .replace('{lng}', language)
        .replace('{ns}', namespace)
        .concat(`.${fileType}`);

      const fullPath = `${basePath}/${filePath}`;
      const translation = data?.[namespace]?.[language] || { hi: 'hi' };
      files[fullPath] =
        fileType === 'json'
          ? dataToJson(translation)
          : dataToJsOrTs(translation, language);
    });
  });
  return files;
};
