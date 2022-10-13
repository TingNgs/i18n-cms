import { createSelector } from '@reduxjs/toolkit';
import { RootState, useAppSelector } from '../../../redux/store';

import { useLazyGetGithubContentQuery } from '../../../redux/services/octokitApi';
import {
  decodeGithubFileContent,
  getLocalPath
} from '../../../utils/fileHelper';

const propsSelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.editingRepo?.repo,
  (state: RootState) => state.EditingRepoReducer.editingRepo?.owner,
  (state: RootState) => state.EditingRepoReducer.editingRepoConfig,
  (state: RootState) => state.EditingRepoReducer.branch,
  (state: RootState) => state.EditingRepoReducer.languages,
  (repo, owner, repoConfig, branch, languages) => ({
    repo,
    owner,
    repoConfig,
    branch,
    languages
  })
);

const useGetEditingRepoLocalByNs = () => {
  const { repo, owner, repoConfig, branch, languages } =
    useAppSelector(propsSelector);

  const [getGithubContent] = useLazyGetGithubContentQuery();

  const getLocalByNamespace = async ({ namespace }: { namespace: string }) => {
    if (!repo || !owner || !repoConfig) return;
    const filesPromise = languages.map((language) =>
      getGithubContent({
        repo: repo,
        owner: owner,
        ref: branch,
        path: getLocalPath({ language, namespace, repoConfig })
      }).unwrap()
    );
    const files = await Promise.all(filesPromise);
    return files.reduce<{ [language: string]: { [key: string]: string } }>(
      (acc, cur, index) => {
        const file = decodeGithubFileContent(cur);
        acc[languages[index]] = JSON.parse(file);
        return acc;
      },
      {}
    );
  };

  return getLocalByNamespace;
};

export default useGetEditingRepoLocalByNs;
