import { Owner } from '../../component/OwnerSelect';
import { REPOSITORY_VISIBILITY } from '../../constants';
import { RepoConfig } from '../../redux/editingRepoSlice';

interface GitApi {
  getCurrentUser: () => Promise<{ name: string }>;
  getOrganization: () => Promise<{ name: string }[]>;
  getRepo: (data: { owner: string; repo: string }) => Promise<{
    owner: string;
    repo: string;
    full_name: string;
    permission: 'write' | 'admin' | 'read' | 'none';
  }>;
  createRepo: (data: {
    name: string;
    visibility: typeof REPOSITORY_VISIBILITY[number];
    owner: Owner;
  }) => Promise<{
    owner: string;
    repo: string;
    full_name: string;
    default_branch: string;
  }>;
  getContent: (data: {
    repo: string;
    owner: string;
    path: string;
    branch: string;
    commitHash: string;
  }) => Promise<string>;
  createBranch: (data: {
    repo: string;
    owner: string;
    branch: string;
    hash: string;
  }) => Promise<unknown>;
  getTree: (data: {
    repo: string;
    owner: string;
    hash: string;
    repoConfig: RepoConfig;
  }) => Promise<{ path?: string }[]>;
  getBranch: (data: {
    repo: string;
    owner: string;
    branch: string;
  }) => Promise<{
    commitHash: string;
    treeHash: string;
    name: string;
    isProtected: boolean;
  }>;
  commitFiles: (data: {
    repo: string;
    owner: string;
    branch: string;
    message: string;
    filesToDelete?: string[];
    files: { [path: string]: string };
  }) => Promise<{ url: string; hash: string }>;
}

export default GitApi;
