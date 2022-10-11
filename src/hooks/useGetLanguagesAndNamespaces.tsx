import path from 'path-browserify';
import { useState } from 'react';
import { Repo, RepoConfig } from '../redux/editingRepoSlice';
import {
  useLazyGetGithubContentQuery,
  useLazyGetGithubTreeQuery
} from '../redux/services/octokitApi';

const useGetLanguagesAndNamespaces = () => {
  const [isLoading, setLoading] = useState(false);

  const [getGithubContent] = useLazyGetGithubContentQuery();
  const [getGithubTree] = useLazyGetGithubTreeQuery();

  const getLanguagesNadNamespaces = async ({
    repo,
    repoConfig,
    branch
  }: {
    repo: Repo;
    repoConfig: RepoConfig;
    branch: string;
  }) => {
    try {
      setLoading(true);
      const folder = await getGithubContent({
        repo: repo.repo,
        owner: repo.owner,
        ref: branch,
        path: repoConfig.basePath
      }).unwrap();

      const localesFolder =
        Array.isArray(folder) &&
        folder.find((item) => item.type === 'dir' && item.name === 'locales');

      if (!localesFolder) {
        throw new Error('localesFolderNotFound');
      }

      const treeData = await getGithubTree({
        repo: repo.repo,
        owner: repo.owner,
        treeSha: localesFolder.sha
      }).unwrap();
      const { namespacesSet, languagesSet } = treeData.tree
        .filter((tree) => tree.type === 'blob')
        .reduce<{ namespacesSet: Set<string>; languagesSet: Set<string> }>(
          (acc, cur) => {
            if (!cur.path) return acc;
            const { dir, name } = path.parse(cur.path);
            if (repoConfig.fileStructure === 'locales/{lng}/{ns}') {
              acc.namespacesSet.add(name);
              acc.languagesSet.add(dir);
            }
            if (repoConfig.fileStructure === 'locales/{ns}/{lng}') {
              acc.namespacesSet.add(dir);
              acc.languagesSet.add(name);
            }
            return acc;
          },
          {
            namespacesSet: new Set(),
            languagesSet: new Set()
          }
        );
      return {
        namespaces: Array.from(namespacesSet),
        languages: Array.from(languagesSet)
      };
    } finally {
      setLoading(false);
    }
  };

  return [getLanguagesNadNamespaces, { isLoading }] as const;
};

export default useGetLanguagesAndNamespaces;
