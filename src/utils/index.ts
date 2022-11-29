import { Repo } from '../redux/editingRepoSlice';

export const getGithubUrl = (repo: Repo) =>
  `https://github.com/${repo.fullName}`;

export const getBranchUrl = (repo: Repo, branch: string) =>
  `${getGithubUrl(repo)}/tree/${branch}`;
