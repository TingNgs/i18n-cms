import { compact, map } from 'lodash-es';

import { useState } from 'react';
import multimatch from 'multimatch';
import UrlPattern from 'url-pattern';

import { Repo, RepoConfig } from '../../../redux/editingRepoSlice';

import { useLazyGetGithubTreeQuery } from '../../../redux/services/octokitApi';
import { LOCALES_FILE_TYPE_MAP } from '../../../constants';

const useGetLanguagesAndNamespaces = () => {
  const [isLoading, setLoading] = useState(false);

  const [getGithubTree] = useLazyGetGithubTreeQuery();

  const getLanguagesAndNamespaces = async ({
    repo,
    repoConfig,
    rootSha
  }: {
    repo: Repo;
    repoConfig: RepoConfig;
    branch: string;
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
          .replace(':lng', `{${repoConfig.languages.join(',')}}`)
          .concat(`.${LOCALES_FILE_TYPE_MAP[repoConfig.fileType].ext}`)
      );
      const pattern = new UrlPattern(
        repoConfig.pattern
          .replace(':ns', '*')
          .concat(`.${LOCALES_FILE_TYPE_MAP[repoConfig.fileType].ext}`)
      );
      const { namespacesSet, languagesSet } = pathList.reduce<{
        namespacesSet: Set<string>;
        languagesSet: Set<string>;
      }>(
        (acc, cur) => {
          const match = pattern.match(cur);
          if (match.lng && match._) {
            acc.languagesSet.add(match.lng);
            acc.namespacesSet.add(match._);
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
