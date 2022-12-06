import { Bitbucket } from 'bitbucket';
import multimatch from 'multimatch';
import { FILE_TYPE_MAP_DATA } from '../../../constants';
import { getSessionStorage } from '../../storage';
import { ERROR_MSG } from '../constants';
import GitApi from '../interface';

let bitbucket = new Bitbucket({ notice: false });
let prevToken: string | undefined = undefined;
const setupBitbucketClient = () => {
  const token = (getSessionStorage('git_provider') === 'bitbucket' &&
    getSessionStorage('access_token')) as string;
  if (prevToken !== token) {
    prevToken = token;
    bitbucket = new Bitbucket({
      notice: false,
      auth: window.Cypress
        ? {
            password: Cypress.env('BITBUCKET_PAT'),
            username: Cypress.env('BITBUCKET_OWNER')
          }
        : { token }
    });
  }
};
setupBitbucketClient();

const BitbucketApi: GitApi = {
  getCurrentUser: async () => {
    setupBitbucketClient();
    const result = await bitbucket.users.getAuthedUser({});
    return { name: result.data.username || '' };
  },
  getOrganization: async () => {
    setupBitbucketClient();
    const result = await bitbucket.workspaces.getWorkspaces({});
    return (
      result.data?.values?.map((value) => ({ name: value.slug || '' })) || []
    );
  },
  getRepo: async ({ repo, owner }) => {
    setupBitbucketClient();
    const { data } = await bitbucket.repositories
      .get({
        repo_slug: repo,
        workspace: owner
      })
      .catch((err) => {
        if (err.status === 404) throw new Error(ERROR_MSG.REPO_NOT_FOUND);
        throw err;
      });

    const { data: permissions } = await bitbucket.user.listPermissionsForRepos({
      q: `repository.uuid="${data.uuid}"`
    });

    return {
      owner: data.full_name?.split('/')[0] || '',
      full_name: data.full_name || '',
      repo: data.name || '',
      permission: permissions?.values?.[0]?.permission || 'none'
    };
  },
  createRepo: async ({ name, visibility, owner }) => {
    setupBitbucketClient();
    const { data } = await bitbucket.repositories
      .create({
        repo_slug: name,
        workspace: owner.name,
        _body: {
          is_private: visibility === 'private',
          type: 'repository'
        }
      })
      .catch((err) => {
        if (
          err?.error?.error?.message?.includes?.(
            'Repository with this Slug and Owner already exists.'
          )
        ) {
          throw new Error(ERROR_MSG.REPO_ALREADY_EXIST);
        }
        throw err;
      });
    return {
      owner: data.full_name?.split('/')[0] || '',
      repo: data.name || '',
      default_branch: data.mainbranch?.name || '',
      full_name: data.full_name || ''
    };
  },
  getContent: async ({ repo, owner, path, commitHash }) => {
    setupBitbucketClient();
    const result = await bitbucket.source.read({
      workspace: owner,
      repo_slug: repo,
      path,
      commit: commitHash
    });
    return result?.data as unknown as string;
  },
  createBranch: async ({ repo, owner, branch, hash }) => {
    setupBitbucketClient();
    const result = await bitbucket.repositories
      .createBranch({
        repo_slug: repo,
        workspace: owner,
        _body: { name: branch, target: { hash } }
      })
      .catch((err) => {
        if (err.error.error.code === 'BRANCH_ALREADY_EXISTS')
          throw new Error(ERROR_MSG.BRANCH_ALREADY_EXIST);
        if (err.error.error.code === 'BRANCH_PERMISSION_VIOLATED')
          throw new Error(ERROR_MSG.BRANCH_PERMISSION_VIOLATED);
        throw err;
      });
    return result.data;
  },
  getTree: async ({ repo, owner, hash, repoConfig }) => {
    setupBitbucketClient();
    let data: {
      path?: string | undefined;
    }[] = [];

    let page: string | undefined = undefined;
    do {
      const pathQuery = `${repoConfig.pattern}.${
        FILE_TYPE_MAP_DATA[repoConfig.fileType].ext
      }`
        .replace(':lng', repoConfig.defaultLanguage)
        .split(':ns')
        .filter((path) => !!path);

      const result = await bitbucket.source.read({
        commit: hash,
        repo_slug: repo,
        workspace: owner,
        path: '/',
        max_depth: 1024,
        pagelen: 100,
        q: `type="commit_file"${pathQuery
          .map((path) => ` AND path~"${path}"`)
          .join('')}`,
        page
      });
      data = data.concat(
        result.data.values?.map((value) => ({ path: value.path })) || []
      );
      if (!result.data.next) break;
      const nextParams = `?${result.data.next.split('?')[1]}`;
      page = (new URLSearchParams(nextParams).get('page') || undefined) as
        | string
        | undefined;
    } while (page);
    return data;
  },
  getBranch: async ({ repo, owner, branch }) => {
    setupBitbucketClient();
    const { data } = await bitbucket.repositories
      .getBranch({
        repo_slug: repo,
        workspace: owner,
        name: branch
      })
      .catch((err) => {
        if (err.status === 404) {
          throw new Error(ERROR_MSG.BRANCH_NOT_FOUND);
        }
        throw err;
      });
    const { data: restrictions } =
      await bitbucket.repositories.listBranchRestrictions({
        repo_slug: repo,
        workspace: owner,
        kind: 'push'
      });

    const isProtected =
      multimatch(
        branch,
        (restrictions.values
          ?.filter((restriction) => !!restriction.pattern)
          .map((restriction) => restriction.pattern) || []) as string[]
      ).length > 0;

    return {
      commitHash: data.target?.hash || '',
      treeHash: data.target?.hash || '',
      name: data.name || '',
      isProtected
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
    setupBitbucketClient();

    const requestBody = new FormData();
    requestBody.append('branch', branch);
    requestBody.append('message', message);
    Object.entries(files).forEach(([path, value]) => {
      requestBody.append(path, value);
    });
    filesToDelete?.forEach((path) => {
      requestBody.append('files', path);
    });

    await bitbucket.source.createFileCommit({
      workspace: owner,
      repo_slug: repo,
      _body: requestBody
    });
    const { data } = await bitbucket.repositories.getBranch({
      name: branch,
      repo_slug: repo,
      workspace: owner
    });

    return {
      url:
        (data.target?.links as { html?: { href?: string } })?.html?.href ||
        `https://bitbucket.org/${owner}/${repo}/commits/${data.target?.hash}`,
      hash: data.target?.hash || ''
    };
  }
};

export default BitbucketApi;
