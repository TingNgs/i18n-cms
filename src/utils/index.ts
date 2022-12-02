import { Repo } from '../redux/editingRepoSlice';
import { getSessionStorage } from './storage';

export const getRepoUrl = (repo: { fullName: string }) => {
  switch (getSessionStorage('git_provider')) {
    case 'bitbucket':
      return `https://bitbucket.org/${repo.fullName}`;
    case 'github':
    default:
      return `https://github.com/${repo.fullName}`;
  }
};

export const getBranchUrl = (repo: Repo, branch: string) => {
  switch (getSessionStorage('git_provider')) {
    case 'bitbucket':
      return `${getRepoUrl(repo)}/branch/${branch}`;
    case 'github':
    default:
      return `${getRepoUrl(repo)}/tree/${branch}`;
  }
};
