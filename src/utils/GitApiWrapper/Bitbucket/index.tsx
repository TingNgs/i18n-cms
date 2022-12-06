import { Bitbucket } from 'bitbucket';
import multimatch from 'multimatch';
import { FILE_TYPE_MAP_DATA } from '../../../constants';
import { getSessionStorage, setSessionStorage } from '../../storage';
import { ERROR_MSG } from '../constants';
import GitApi from '../interface';

let isRefreshing = false;
let refreshQueue: (() => void)[] = [];
const refreshAccessToken = async () => {
  try {
    const refreshToken = getSessionStorage('refresh_token');
    const data = await fetch(
      `${process.env.REACT_APP_FUNCTIONS_URL}bitbucket/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      }
    ).then((res) => res.json());
    const { access_token, expires_in, refresh_token } = data;

    setSessionStorage('access_token', access_token);
    setSessionStorage(
      'expire_in',
      (Date.now() + 1000 * parseInt(expires_in)).toString()
    );
    setSessionStorage('refresh_token', refresh_token);
  } finally {
    isRefreshing = false;
    refreshQueue.forEach((res) => res());
    refreshQueue = [];
  }
};

let bitbucket = new Bitbucket({ notice: false });
let prevToken: string | undefined = undefined;
const setupBitbucketClient = async () => {
  const expireIn = getSessionStorage('expire_in');
  if (expireIn && parseInt(expireIn) < Date.now()) {
    if (!isRefreshing) {
      refreshAccessToken();
      isRefreshing = true;
    }
    await new Promise<void>((res) => {
      refreshQueue.push(res);
    });
  }

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
    await setupBitbucketClient();
    const result = await bitbucket.users.getAuthedUser({});
    return { name: result.data.username || '' };
  },
  getOrganization: async () => {
    await setupBitbucketClient();
    const result = await bitbucket.workspaces.getWorkspaces({});
    return (
      result.data?.values?.map((value) => ({ name: value.slug || '' })) || []
    );
  },
  getRepo: async ({ repo, owner }) => {
    await setupBitbucketClient();
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
    await setupBitbucketClient();
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
    await setupBitbucketClient();
    const result = await bitbucket.source.read({
      workspace: owner,
      repo_slug: repo,
      path,
      commit: commitHash
    });
    return result?.data as unknown as string;
  },
  createBranch: async ({ repo, owner, branch, hash }) => {
    await setupBitbucketClient();
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
    await setupBitbucketClient();
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
    await setupBitbucketClient();
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
    await setupBitbucketClient();

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
