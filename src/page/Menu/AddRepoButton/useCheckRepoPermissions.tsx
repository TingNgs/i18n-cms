import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Repo } from '../../../redux/editingRepoSlice';
import { useLazyGetRepoQuery } from '../../../redux/services/octokitApi';
import { ERROR_MSG } from '../../../utils/GitApiWrapper/constants';

const useCheckRepoPermissions = () => {
  const { t } = useTranslation();
  const { t: menuT } = useTranslation('menu');

  const [getRepo] = useLazyGetRepoQuery();

  const checkRepoPermissions = useCallback(
    async ({
      repoName,
      owner
    }: {
      repoName: string;
      owner: string;
    }): Promise<{
      data?: { repo: Omit<Repo, 'recentBranches'> };
      error?: string;
    }> => {
      try {
        const repo = await getRepo({
          repo: repoName,
          owner: owner
        }).unwrap();
        if (!['admin', 'write'].includes(repo.permission)) {
          return { error: menuT('Without push permission in this repo') };
        }

        return {
          data: {
            repo: {
              owner: repo.owner,
              repo: repo.repo,
              fullName: repo.full_name
            }
          }
        };
      } catch (e) {
        if ((e as { message: string })?.message === ERROR_MSG.REPO_NOT_FOUND) {
          return { error: t('Repository not found') };
        }
        return { error: t('Something went wrong') };
      }
    },
    []
  );

  return checkRepoPermissions;
};

export default useCheckRepoPermissions;
