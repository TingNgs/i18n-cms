import { Repo } from '../redux/editingRepoSlice';

export const getGithubUrl = (repo: Repo) =>
  `https://github.com/${repo.fullName}`;

export const getGithubBranchUrl = (repo: Repo, branch: string) =>
  `${getGithubUrl}/tree/${branch}`;
