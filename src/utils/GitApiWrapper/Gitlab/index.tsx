import { Gitlab } from '@gitbeaker/browser';
import { getSessionStorage } from '../../storage';
import { ERROR_MSG } from '../constants';
import GitApi from '../interface';

let gitlab = new Gitlab({});

let prevToken: string | undefined = undefined;
const setupGitlabClient = () => {
  const token = (getSessionStorage('git_provider') === 'gitlab' &&
    getSessionStorage('access_token')) as string;
  if (prevToken !== token) {
    prevToken = token;
    gitlab = new Gitlab({
      oauthToken: token
    });
  }
};
setupGitlabClient();

const GitlabApi = {
  getCurrentUser: async () => {
    setupGitlabClient();
    const result = await gitlab.Users.current();
    return { name: result.username };
  },
  getOrganization: async () => {
    setupGitlabClient();
    const result = await gitlab.Groups.all();
    return result.map((org) => ({ name: org.full_path }));
  },
  getRepo: async ({ repo, owner }) => {
    setupGitlabClient();
    const data = await gitlab.Projects.show(`${owner}/${repo}`).catch((err) => {
      if (err.status === 404) throw new Error(ERROR_MSG.REPO_NOT_FOUND);
      throw err;
    });

    const accessLevel = Math.max(
      data.permissions.project_access?.access_level || 0,
      data.permissions.group_access?.access_level || 0
    );

    const permission = accessLevel >= 30 ? 'write' : 'read';

    return {
      owner: data.namespace.path,
      full_name: data.path_with_namespace,
      repo: data.path,
      permission
    };
  }
} as GitApi;

export default GitlabApi;
