import { compact, map } from 'lodash-es';

import { useState } from 'react';
import multimatch from 'multimatch';
import UrlPattern from 'url-pattern';

import { Repo, RepoConfig } from '../../../redux/editingRepoSlice';

import { useLazyGetGithubTreeQuery } from '../../../redux/services/octokitApi';
import { LOCALES_FILE_TYPE_MAP } from '../../../constants';

const useGetNamespaces = () => {
  const [isLoading, setLoading] = useState(false);

  const [getGithubTree] = useLazyGetGithubTreeQuery();

  const getNamespaces = async ({
    repo,
    repoConfig,
    rootSha
  }: {
    repo: Repo;
    repoConfig: RepoConfig;
    rootSha: string;
  }) => {
    try {
      setLoading(true);
      const treeSha = rootSha;
      const treeData = await getGithubTree({
        repo: repo.repo,
        owner: repo.owner,
        treeSha
      }).unwrap();

      const pathList = multimatch(
        compact(map(treeData.tree, 'path')),
        repoConfig.pattern
          .replace(':ns', '**')
          .replace(
            ':lng',
            repoConfig.languages.length > 1
              ? `{${repoConfig.languages.join(',')}}`
              : repoConfig.languages[0]
          )
          .concat(`.${LOCALES_FILE_TYPE_MAP[repoConfig.fileType].ext}`)
      );
      const pattern = new UrlPattern(
        repoConfig.pattern
          .replace(':ns', '*')
          .concat(`.${LOCALES_FILE_TYPE_MAP[repoConfig.fileType].ext}`)
      );
      const namespacesSet = pathList.reduce<Set<string>>((acc, cur) => {
        const match = pattern.match(cur);
        if (match.lng && match._) {
          acc.add(match._);
        }
        return acc;
      }, new Set());
      return Array.from(namespacesSet);
    } finally {
      setLoading(false);
    }
  };

  return [getNamespaces, { isLoading }] as const;
};

export default useGetNamespaces;
