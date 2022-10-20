import path from 'path-browserify';
import { useState } from 'react';
import { CONFIG_FOLDER } from '../../../constants';
import { Repo, RepoConfig } from '../../../redux/editingRepoSlice';
import {
  useLazyGetGithubContentQuery,
  useLazyGetGithubTreeQuery
} from '../../../redux/services/octokitApi';

const useGetLanguagesAndNamespaces = () => {
  const [isLoading, setLoading] = useState(false);

  const [getGithubContent] = useLazyGetGithubContentQuery();
  const [getGithubTree] = useLazyGetGithubTreeQuery();

  const getLanguagesAndNamespaces = async ({
    repo,
    repoConfig,
    branch,
    rootSha
  }: {
    repo: Repo;
    repoConfig: RepoConfig;
    branch: string;
    rootSha: string;
  }) => {
    try {
      setLoading(true);
      let treeSha = rootSha;
      const localesPath = repoConfig.basePath
        .split('/')
        .filter((path) => !!path);

      if (localesPath.length > 0) {
        const localesFolderName = localesPath.pop();
        const folder = await getGithubContent({
          repo: repo.repo,
          owner: repo.owner,
          ref: branch,
          path: localesPath.join('/')
        }).unwrap();

        const localesFolder =
          Array.isArray(folder) &&
          folder.find(
            (item) => item.type === 'dir' && item.name === localesFolderName
          );

        if (!localesFolder) {
          throw new Error('localesFolderNotFound');
        }
        treeSha = localesFolder.sha;
      }

      const treeData = await getGithubTree({
        repo: repo.repo,
        owner: repo.owner,
        treeSha
      }).unwrap();
      const { namespacesSet, languagesSet } = treeData.tree
        .filter((tree) => tree.type === 'blob')
        .reduce<{ namespacesSet: Set<string>; languagesSet: Set<string> }>(
          (acc, cur) => {
            if (!cur.path) return acc;
            const { dir, name } = path.parse(cur.path);
            if (
              repoConfig.basePath === '' &&
              (dir === CONFIG_FOLDER || !dir || dir.startsWith('.'))
            ) {
              return acc;
            }
            if (repoConfig.fileStructure === '{lng}/{ns}') {
              acc.namespacesSet.add(name);
              acc.languagesSet.add(dir);
            }
            if (repoConfig.fileStructure === '{ns}/{lng}') {
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

  return [getLanguagesAndNamespaces, { isLoading }] as const;
};

export default useGetLanguagesAndNamespaces;
