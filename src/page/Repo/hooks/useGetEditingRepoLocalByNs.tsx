import { flatten } from 'flat';
import { useAppStore } from '../../../redux/store';

import { useLazyGetContentQuery } from '../../../redux/services/octokitApi';
import { fileParseByType, getLocalePath } from '../../../utils/fileHelper';

const useGetEditingRepoLocalByNs = () => {
  const { getState } = useAppStore();

  const [getContent] = useLazyGetContentQuery();

  const getLocalByNamespace = async ({ namespace }: { namespace: string }) => {
    const {
      editingRepo,
      editingRepoConfig: repoConfig,
      branch,
      commitHash,
      originalLanguages: languages
    } = getState().EditingRepoReducer;
    const { repo, owner } = editingRepo || {};

    if (!repo || !owner || !repoConfig || !branch || !commitHash) return;
    const filesPromise = languages.map(async (language) =>
      getContent({
        repo: repo,
        owner: owner,
        branch,
        path: await getLocalePath({ language, namespace, repoConfig }),
        commitHash: commitHash || ''
      })
        .unwrap()
        .catch(() => undefined)
    );
    const files = await Promise.all(filesPromise);
    return files.reduce<{ [language: string]: { [key: string]: string } }>(
      (acc, cur, index) => {
        acc[languages[index]] = flatten(
          fileParseByType[repoConfig.fileType](cur)
        );
        return acc;
      },
      {}
    );
  };

  return getLocalByNamespace;
};

export default useGetEditingRepoLocalByNs;
