import { Repo } from '../redux/editingRepoSlice';
import { getSessionStorage } from './storage';

export const getRepoUrl = (
  repo: { fullName: string },
  gitProvider = getSessionStorage('git_provider')
) => {
  switch (gitProvider) {
    case 'bitbucket':
      return `https://bitbucket.org/${repo.fullName}`;
    case 'gitlab':
      return `https://gitlab.com/${repo.fullName}`;
    case 'github':
    default:
      return `https://github.com/${repo.fullName}`;
  }
};

export const getBranchUrl = (
  repo: Repo,
  branch: string,
  gitProvider = getSessionStorage('git_provider')
) => {
  switch (gitProvider) {
    case 'bitbucket':
      return `${getRepoUrl(repo)}/branch/${branch}`;
    case 'gitlab':
      return `${getRepoUrl(repo)}/-/tree/${branch}`;
    case 'github':
    default:
      return `${getRepoUrl(repo)}/tree/${branch}`;
  }
};
