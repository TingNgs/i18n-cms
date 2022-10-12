import isBase64 from 'is-base64';
import { Octokit } from 'octokit';
import { Buffer } from 'buffer';

export interface Options {
  owner: string;
  repo: string;
  branch: string;
  base?: string;
  batchSize?: number;
  createBranch?: boolean;
  committer?: {
    name?: string;
    email?: string;
    date?: string;
  };
  author?: {
    name: string;
    email: string;
    date?: string;
  };
  change: {
    message: string;
    filesToDelete?: string[];
    ignoreDeletionFailures?: string;
    files: {
      [path: string]: string;
    };
  };
}

interface TreeItem {
  path: string;
  sha: string;
  mode?: '100644' | '100755' | '040000' | '160000' | '120000';
  type?: 'tree' | 'blob' | 'commit';
}

async function fileExistsInRepo(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  branch: string
) {
  try {
    await octokit.rest.repos.getContent({
      method: 'HEAD',
      owner,
      repo,
      path,
      ref: branch
    });
    return true;
  } catch (e) {
    return false;
  }
}

async function createBlob(
  octokit: Octokit,
  owner: string,
  repo: string,
  contents: string,
  type: string
) {
  if (type === 'commit') {
    return contents;
  } else {
    let content = contents;

    if (!isBase64(content)) {
      content = Buffer.from(contents).toString('base64');
    }

    const file = (
      await octokit.rest.git.createBlob({
        owner,
        repo,
        content,
        encoding: 'base64'
      })
    ).data;
    return file.sha;
  }
}

async function loadRef(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string
) {
  try {
    const x = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${ref}`
    });
    return x.data.object.sha;
  } catch (e) {
    // console.log(e);
  }
}

const chunk = (input: string[], size: number) => {
  return input.reduce<string[][]>((acc, item, idx) => {
    return idx % size === 0
      ? [...acc, [item]]
      : [...acc.slice(0, -1), [...acc.slice(-1)[0], item]];
  }, []);
};

export default async function (octokit: Octokit, opts: Options) {
  for (const req of ['owner', 'repo', 'branch'] as const) {
    if (!opts[req]) {
      throw new Error(`'${req}' is a required parameter`);
    }
  }

  if (!opts.batchSize) {
    opts.batchSize = 1;
  }

  if (typeof opts.batchSize !== 'number') {
    throw new Error(`batchSize must be a number`);
  }

  // Destructuring for easier access later
  const {
    owner,
    repo,
    branch: branchName,
    createBranch = true,
    committer,
    author,
    change,
    batchSize
  } = opts;
  let { base } = opts;

  let branchAlreadyExists = true;
  let baseTree: undefined | string = '';

  // Does the target branch already exist?
  baseTree = await loadRef(octokit, owner, repo, branchName);
  if (!baseTree) {
    if (!createBranch) {
      throw new Error(
        `The branch '${branchName}' doesn't exist and createBranch is 'false'`
      );
    }

    branchAlreadyExists = false;

    // If not we use the base branch. If not provided, use the
    // default from the repo
    if (!base) {
      // Work out the default branch
      base = (
        await octokit.rest.repos.get({
          owner,
          repo
        })
      ).data.default_branch;
    }

    baseTree = await loadRef(octokit, owner, repo, base);

    if (!baseTree) {
      throw new Error(`The branch '${base}' doesn't exist`);
    }
  }

  const message = change.message;
  if (!message) {
    throw new Error(`change[].message is a required parameter`);
  }

  const hasFiles = change.files && Object.keys(change.files).length > 0;

  const hasFilesToDelete =
    Array.isArray(change.filesToDelete) && change.filesToDelete.length > 0;

  if (!hasFiles && !hasFilesToDelete) {
    throw new Error(
      `either change[].files or change[].filesToDelete are required`
    );
  }

  const treeItems: TreeItem[] = [];
  // Handle file deletions
  if (hasFilesToDelete) {
    for (const batch of chunk(change.filesToDelete || [], batchSize)) {
      await Promise.all(
        batch.map(async (fileName) => {
          if (!baseTree) throw new Error('base tree undefined');
          const exists = await fileExistsInRepo(
            octokit,
            owner,
            repo,
            fileName,
            baseTree
          );

          // If it doesn't exist, and we're not ignoring missing files
          // reject the promise
          if (!exists && !change.ignoreDeletionFailures) {
            throw new Error(
              `The file ${fileName} could not be found in the repo`
            );
          }

          // At this point it either exists, or we're ignoring failures
          if (exists) {
            treeItems.push({
              path: fileName,
              sha: '', // sha as null implies that the file should be deleted
              mode: '100644',
              type: 'commit'
            });
          }
        })
      );
    }
  }

  for (const batch of chunk(Object.keys(change.files), batchSize)) {
    await Promise.all(
      batch.map(async (fileName) => {
        const properties = change.files[fileName] || '';

        const contents = properties;
        const mode = '100644';
        const type = 'blob';

        if (!contents) {
          throw new Error(`No file contents provided for ${fileName}`);
        }

        const fileSha = await createBlob(octokit, owner, repo, contents, type);

        treeItems.push({
          path: fileName,
          sha: fileSha,
          mode: mode,
          type: type
        });
      })
    );
  }

  // no need to issue further requests if there are no updates, creations and deletions
  if (treeItems.length === 0) {
    throw new Error('Nothing change');
  }
  if (!baseTree) throw new Error('base tree undefined');

  // Add those blobs to a tree
  const { data: tree } = await octokit.rest.git.createTree({
    owner,
    repo,
    tree: treeItems,
    base_tree: baseTree
  });

  // Create a commit that points to that tree
  const { data: commit } = await octokit.rest.git.createCommit({
    owner,
    repo,
    message,
    committer,
    author,
    tree: tree.sha,
    parents: [baseTree]
  });

  // Update the base tree if we have another commit to make
  baseTree = commit.sha;

  // Create a ref that points to that tree
  let action: 'createRef' | 'updateRef' = 'createRef';
  let updateRefBase = 'refs/';

  // Or if it already exists, we'll update that existing ref
  if (branchAlreadyExists) {
    action = 'updateRef';
    updateRefBase = '';
  }
  if (!baseTree) throw new Error('base tree undefined');
  await octokit.rest.git[action]({
    owner,
    repo,
    force: true,
    ref: `${updateRefBase}heads/${branchName}`,
    sha: baseTree
  });

  // Return the new branch name so that we can use it later
  // e.g. to create a pull request
  return { commit };
}
