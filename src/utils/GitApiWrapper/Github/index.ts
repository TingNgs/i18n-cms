import { Octokit } from '@octokit/rest';
import { graphql, GraphQlQueryResponseData } from '@octokit/graphql';
import multimatch from 'multimatch';
import commitMultipleFiles from './commitMultipleFiles';
import { getSessionStorage } from '../../storage';
import GitApi from '../interface';
import { ERROR_MSG } from '../constants';

let octokit = new Octokit();
let graphqlWithAuth = graphql;
let prevToken: string | undefined = undefined;
const setupOctokitClient = () => {
  const token = (getSessionStorage('git_provider') === 'github' &&
    getSessionStorage('access_token')) as string;
  if (prevToken !== token) {
    prevToken = token;
    octokit = new Octokit({
      auth: token
    });
    graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${token}`
      }
    });
  }
};
setupOctokitClient();

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
    const { data } = await octokit.rest.repos
      .get({ repo, owner })
      .catch((err) => {
        if (err.status === 404) throw new Error(ERROR_MSG.REPO_NOT_FOUND);
        throw err;
      });

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
    try {
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
    } catch (err) {
      if (
        (err as { message?: string })?.message?.includes?.(
          'name already exists on this account'
        )
      ) {
        throw new Error(ERROR_MSG.REPO_ALREADY_EXIST);
      }
      throw err;
    }
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

    const patterns = await graphqlWithAuth(
      `query getRepository($repo: String!, $owner:String!) {
          repository(name:$repo, owner: $owner) {
            branchProtectionRules(first: 100) {
              nodes {
                pattern
              }
            }
          }
        }`,
      {
        repo,
        owner
      }
    ).then((data) => {
      return (
        data as GraphQlQueryResponseData
      ).repository.branchProtectionRules.nodes.map(
        ({ pattern }: { pattern: string }) => pattern
      );
    });

    if (multimatch(branch, patterns).length > 0) {
      throw new Error(ERROR_MSG.BRANCH_PERMISSION_VIOLATED);
    }

    const result = await octokit.rest.git
      .createRef({
        repo,
        owner,
        ref: `refs/heads/${branch}`,
        sha: hash
      })
      .catch((err) => {
        if (err.message === 'Reference already exists')
          throw new Error(ERROR_MSG.BRANCH_ALREADY_EXIST);
        throw err;
      });

    const { data: newBranch } = await octokit.rest.repos.getBranch({
      repo,
      owner,
      branch
    });
    if (newBranch.protected) {
      throw new Error(ERROR_MSG.BRANCH_PERMISSION_VIOLATED);
    }

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
    const { data } = await octokit.rest.repos
      .getBranch({
        repo,
        owner,
        branch
      })
      .catch((err) => {
        console.log(err);
        if (err.status === 404) {
          throw new Error(ERROR_MSG.BRANCH_NOT_FOUND);
        }
        throw err;
      });
    return {
      commitHash: data.commit.sha,
      treeHash: data.commit.commit.tree.sha,
      name: data.name,
      isProtected: data.protected
    };
  },
  commitFiles: async ({
    repo,
    owner,
    branch,
    message,
    filesToDelete,
    files
  }) => {
    setupOctokitClient();
    const result = await commitMultipleFiles(octokit, {
      owner,
      branch,
      repo,
      change: {
        files,
        message,
        filesToDelete,
        ignoreDeletionFailures: true
      }
    });
    return { url: result.commit.html_url, hash: result.commit.sha };
  }
};

export default Github;
