import flatten from 'flat';
import { useAppStore } from '../../../redux/store';

import { useLazyGetGithubContentQuery } from '../../../redux/services/octokitApi';
import {
  dataStringifyByType,
  fileParseByType,
  getLocalePath
} from '../../../utils/fileHelper';

const useGetEditingRepoLocalByNs = () => {
  const { getState } = useAppStore();

  const [getGithubContent] = useLazyGetGithubContentQuery();

  const getLocalByNamespace = async ({ namespace }: { namespace: string }) => {
    const {
      editingRepo,
      editingRepoConfig: repoConfig,
      branch,
      originalLanguages: languages
    } = getState().EditingRepoReducer;
    const { repo, owner } = editingRepo || {};

    if (!repo || !owner || !repoConfig) return;
    const filesPromise = languages.map((language) =>
      getGithubContent({
        repo: repo,
        owner: owner,
        ref: branch,
        path: getLocalePath({ language, namespace, repoConfig })
      })
        .unwrap()
        .catch(() => null)
    );
    const files = await Promise.all(filesPromise);
    return files.reduce<{ [language: string]: { [key: string]: string } }>(
      (acc, cur, index) => {
        const file = cur || dataStringifyByType[repoConfig.fileType]({});
        acc[languages[index]] = flatten(
          fileParseByType[repoConfig.fileType](file)
        );
        return acc;
      },
      {}
    );
  };

  return getLocalByNamespace;
};

export default useGetEditingRepoLocalByNs;
