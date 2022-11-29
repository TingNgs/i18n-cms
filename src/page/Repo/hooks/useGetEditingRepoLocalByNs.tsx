import flatten from 'flat';
import { useAppStore } from '../../../redux/store';

import { useLazyGetContentQuery } from '../../../redux/services/octokitApi';
import {
  dataStringifyByType,
  fileParseByType,
  getLocalePath
} from '../../../utils/fileHelper';

const useGetEditingRepoLocalByNs = () => {
  const { getState } = useAppStore();

  const [getContent] = useLazyGetContentQuery();

  const getLocalByNamespace = async ({ namespace }: { namespace: string }) => {
    const {
      editingRepo,
      editingRepoConfig: repoConfig,
      branch,
      originalLanguages: languages
    } = getState().EditingRepoReducer;
    const { repo, owner } = editingRepo || {};

    if (!repo || !owner || !repoConfig) return;
    const filesPromise = languages.map(async (language) =>
      getContent({
        repo: repo,
        owner: owner,
        branch,
        path: await getLocalePath({ language, namespace, repoConfig })
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
