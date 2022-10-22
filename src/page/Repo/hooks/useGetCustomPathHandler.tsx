import { useState } from 'react';
import { get } from 'lodash-es';
import { CUSTOM_PATH_HANDLER_PATH } from '../../../constants';
import { Repo } from '../../../redux/editingRepoSlice';
import { useLazyGetGithubContentQuery } from '../../../redux/services/octokitApi';

const useGetCustomPathHandler = () => {
  const [isLoading, setLoading] = useState(false);

  const [getGithubContent] = useLazyGetGithubContentQuery();

  const getCustomPathHandler = async ({
    repo,
    branch
  }: {
    repo: Repo;
    branch: string;
  }) => {
    try {
      setLoading(true);

      const file = await getGithubContent({
        repo: repo.repo,
        owner: repo.owner,
        ref: branch,
        path: CUSTOM_PATH_HANDLER_PATH
      }).unwrap();
      const module = await import(
        /* webpackIgnore: true */ `data:text/javascript;base64,${get(
          file,
          'content'
        )}`
      );
      window.getCustomPath = module.default;
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return [getCustomPathHandler, { isLoading }] as const;
};

export default useGetCustomPathHandler;
