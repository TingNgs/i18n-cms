import { Owner } from '../../component/OwnerSelect';
import { REPOSITORY_VISIBILITY } from '../../constants';
import { Options } from './Github/commitMultipleFiles';

interface GitApi {
  getCurrentUser: () => Promise<{ name: string }>;
  getOrganization: () => Promise<{ name: string }[]>;
  getRepo: (data: { owner: string; repo: string }) => Promise<{
    owner: string;
    repo: string;
    full_name: string;
    permission: 'write' | 'admin' | 'read';
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
    branch?: string;
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
  }) => Promise<{ path?: string }[]>;
  getBranch: (data: {
    repo: string;
    owner: string;
    branch: string;
  }) => Promise<{
    hash: string;
    treeHash: string;
    name: string;
    isProtected: boolean;
  }>;
  commitFiles: (data: Options) => Promise<{ url: string }>;
}

export default GitApi;
