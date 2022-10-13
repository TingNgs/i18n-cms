import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Repo } from '../../../redux/editingRepoSlice';
import { useLazyGetGithubRepoQuery } from '../../../redux/services/octokitApi';

const useCheckRepoPermissions = () => {
  const { t } = useTranslation();
  const { t: dashboardT } = useTranslation('dashboard');

  const [getGithubRepo] = useLazyGetGithubRepoQuery();

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
        const githubRepo = await getGithubRepo({
          repo: repoName,
          owner: owner
        }).unwrap();
        if (!githubRepo.permissions?.push) {
          return { error: dashboardT('Without push permission in this repo') };
        }

        return {
          data: {
            repo: {
              owner: githubRepo.owner.login,
              repo: githubRepo.name,
              fullName: githubRepo.full_name
            }
          }
        };
      } catch (e) {
        return { error: t('Something went wrong') };
      }
    },
    []
  );

  return checkRepoPermissions;
};

export default useCheckRepoPermissions;
