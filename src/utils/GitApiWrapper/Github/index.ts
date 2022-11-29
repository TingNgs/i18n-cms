import { Octokit } from '@octokit/rest';
import commitMultipleFiles from './commitMultipleFiles';
import { getSessionStorage } from '../../storage';
import GitApi from '../interface';

const auth = getSessionStorage('github_access_token');
let octokit = new Octokit({ auth });
let withAuth = !!auth;

const setupOctokitClient = () => {
  if (!withAuth) {
    withAuth = true;
    const auth = getSessionStorage('github_access_token');
    octokit = new Octokit({
      auth
    });
  }
};

const getPermission = (permissions?: { admin: boolean; push: boolean }) => {
  if (permissions?.admin) return 'admin';
  if (permissions?.push) return 'write';
  return 'read';
};

const Github: GitApi = {
  getCurrentUser: async () => {
    setupOctokitClient();
    const result = await octokit.rest.users.getAuthenticated();
    return { name: result.data.login };
  },
  getOrganization: async () => {
    setupOctokitClient();
    const result = await octokit.rest.orgs.listForAuthenticatedUser();
    return result.data.map((org) => ({ name: org.login }));
  },
  getRepo: async ({ repo, owner }) => {
    setupOctokitClient();
    const { data } = await octokit.rest.repos.get({ repo, owner });
    const permission = getPermission(data.permissions);
    return {
      owner: data.owner.login,
      full_name: data.full_name,
      repo: data.name,
      permission
    };
  },
  createRepo: async ({ name, visibility, owner }) => {
    setupOctokitClient();
    const { data } = await (owner.type === 'user'
      ? octokit.rest.repos.createForAuthenticatedUser({
          name,
          private: visibility === 'private',
          auto_init: true
        })
      : octokit.rest.repos.createInOrg({
          name,
          org: owner.name,
          private: visibility === 'private',
          auto_init: true
        }));
    return {
      owner: data.owner.login,
      repo: data.name,
      default_branch: data.default_branch,
      full_name: data.full_name
    };
  },
  getContent: async ({ repo, owner, path, branch }) => {
    setupOctokitClient();
    const result = await octokit.rest.repos.getContent({
      repo,
      owner,
      path,
      ref: branch,
      mediaType: { format: 'raw' }
    });
    return result?.data as unknown as string;
  },
  createBranch: async ({ repo, owner, branch, hash }) => {
    setupOctokitClient();
    const result = await octokit.rest.git.createRef({
      repo,
      owner,
      ref: `refs/heads/${branch}`,
      sha: hash
    });
    return result.data;
  },
  getTree: async ({ repo, owner, hash }) => {
    setupOctokitClient();
    const result = await octokit.rest.git.getTree({
      repo,
      owner,
      tree_sha: hash,
      recursive: '1'
    });
    return result.data.tree;
  },
  getBranch: async ({ repo, owner, branch }) => {
    setupOctokitClient();
    const { data } = await octokit.rest.repos.getBranch({
      repo,
      owner,
      branch
    });
    return {
      hash: data.commit.sha,
      treeHash: data.commit.commit.tree.sha,
      name: data.name,
      isProtected: !!data.protection.enabled
    };
  },
  commitFiles: async (data) => {
    setupOctokitClient();
    const result = await commitMultipleFiles(octokit, data);
    return { url: result.commit.html_url };
  }
};

export default Github;