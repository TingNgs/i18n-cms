import { Bitbucket } from 'bitbucket';
import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';
import { Gitlab } from '@gitbeaker/browser';
import { noop } from 'lodash-es';
import {
  removeSessionStorage,
  setSessionStorage
} from '../../src/utils/storage';
import { getRepoUrl } from '../../src/utils';

const octokit = new Octokit({ auth: Cypress.env('CY_GITHUB_PAT') });
const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${Cypress.env('CY_GITHUB_PAT')}`
  }
});
const bitbucket = new Bitbucket({
  notice: false,
  auth: {
    password: Cypress.env('BITBUCKET_PAT'),
    username: Cypress.env('BITBUCKET_OWNER')
  }
});

const gitlab = new Gitlab({ token: Cypress.env('GITLAB_PAT') });

export const ERROR_MSG_CLASS = '.chakra-form__error-message';
export const TOAST_CLASS = '.chakra-toast';
export const gitProviders = ['github', 'bitbucket', 'gitlab'] as const;
export type GitProvider = typeof gitProviders[number];
export const waitFor = (cb: () => void) => {
  cy.get('[data-e2e-id="app"]').should('exist').then(cb);
};

export const deleteAllTag = (e2eTitle: string) => {
  cy.get('body').then(($body) => {
    for (
      let i = $body.find(`[data-e2e-id="${e2eTitle}-tag"] button`).length;
      i > 0;
      i--
    ) {
      cy.get(`[data-e2e-id="${e2eTitle}-tag"] button`).first().click();
    }
  });
};

export const visitRepo = (fullName: string, branch?: string) => {
  cy.visit('/menu');
  cy.get('[data-e2e-id="app"]', { timeout: 50000 }).should('exist');
  cy.menuListLoading();
  cy.contains('[data-e2e-id="menu_repo_card"]', fullName).click();
  cy.loadingWithModal();
  cy.location('pathname').should('eq', '/repo');
  cy.get('[data-e2e-id="repo_setup"]').should('exist');

  if (branch) {
    cy.get('input[name="existingBranchName"]').type(branch);
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
  }
};

export const deleteRepo = ({
  repo,
  owner,
  gitProvider
}: {
  repo: string;
  owner?: string;
  gitProvider: GitProvider;
}) => {
  switch (gitProvider) {
    case 'github': {
      waitFor(() => {
        cy.wrap(
          octokit.rest.repos
            .delete({
              owner: owner || getOwner('github'),
              repo: repo
            })
            .catch(noop)
        );
      });
      break;
    }
    case 'bitbucket': {
      waitFor(() => {
        cy.wrap(
          bitbucket.repositories
            .delete({
              repo_slug: repo,
              workspace: owner || getOwner('bitbucket')
            })
            .catch(noop)
        );
      });
      break;
    }
    case 'gitlab': {
      waitFor(() => {
        cy.wrap(
          gitlab.Projects.remove(
            `${owner || getOwner('gitlab')}/${repo}`
          ).catch(noop)
        );
      });
    }
  }
};

export const createRepoFromTemplate = ({
  repo,
  templateRepo,
  gitProvider
}: {
  repo: string;
  templateRepo: string;
  gitProvider: GitProvider;
}) => {
  switch (gitProvider) {
    case 'github': {
      waitFor(() => {
        cy.wrap(
          octokit.rest.repos.createUsingTemplate({
            owner: getOwner('github'),
            name: repo,
            template_owner: getOwner('github'),
            template_repo: templateRepo,
            include_all_branches: true
          })
        );
      });
      break;
    }
    case 'bitbucket': {
      waitFor(() => {
        cy.wrap(
          bitbucket.repositories.createFork({
            repo_slug: templateRepo,
            workspace: getOwner('bitbucket'),
            _body: { type: 'repository', name: repo }
          })
        );
      });
      break;
    }
    case 'gitlab': {
      waitFor(() => {
        cy.wrap(
          gitlab.Projects.fork(`${getOwner('gitlab')}/${templateRepo}`, {
            path: repo,
            name: repo
          })
        );
      });
      break;
    }
  }
};

export const deleteBranch = ({
  gitProvider,
  repo,
  branch,
  owner
}: {
  gitProvider: GitProvider;
  repo: string;
  branch: string;
  owner?: string;
}) => {
  switch (gitProvider) {
    case 'github': {
      waitFor(() => {
        cy.wrap(
          octokit.rest.git.deleteRef({
            owner: owner || getOwner('github'),
            repo,
            ref: `heads/${branch}`
          })
        );
      });
      break;
    }
    case 'bitbucket': {
      waitFor(() => {
        cy.wrap(
          bitbucket.repositories.deleteBranch({
            name: branch,
            repo_slug: repo,
            workspace: owner || getOwner('bitbucket')
          })
        );
      });
      break;
    }
    case 'gitlab': {
      console.log(`${owner || getOwner('gitlab')}/${repo}`, branch);
      waitFor(() => {
        cy.wrap(
          gitlab.Branches.remove(
            `${owner || getOwner('gitlab')}/${repo}`,
            branch
          ) // gitbeaker throw error on success https://github.com/jdalrymple/gitbeaker/issues/2794
            .catch(noop)
        );
      });
      break;
    }
  }
};

export const setBranchProtected = ({
  gitProvider,
  repo,
  branch,
  owner
}: {
  gitProvider: GitProvider;
  repo: string;
  branch: string;
  owner?: string;
}) => {
  switch (gitProvider) {
    case 'github': {
      let id = '';
      waitFor(() => {
        cy.wrap(
          octokit.rest.repos
            .get({
              repo,
              owner: owner || (getOwner('github') as string)
            })
            .then(({ data }) => {
              id = data.node_id;
              return data;
            })
        );
      });
      waitFor(() => {
        cy.wrap(
          graphqlWithAuth(
            `mutation addBranchProtection($repositoryId:ID!, $pattern:String!) {
              createBranchProtectionRule(input: {
                pattern: $pattern
                repositoryId: $repositoryId
              }) {
                branchProtectionRule {
                  id
                }
              }
            }`,
            { repositoryId: id, pattern: branch }
          )
        );
      });

      break;
    }
    case 'bitbucket': {
      waitFor(() => {
        cy.wrap(
          bitbucket.branchrestrictions.create({
            repo_slug: repo,
            workspace: owner || getOwner('bitbucket'),
            _body: {
              kind: 'push',
              type: 'branchrestriction',
              pattern: branch
            }
          })
        );
      });
      break;
    }
    case 'gitlab': {
      waitFor(() => {
        cy.wrap(
          fetch(
            `https://gitlab.com/api/v4/projects/${
              owner || getOwner('gitlab')
            }%2F${repo}/protected_branches?name=${branch}&push_access_level=0`,
            {
              headers: {
                'Private-Token': Cypress.env('GITLAB_PAT')
              },
              method: 'POST'
            }
          )
        );
      });
      break;
    }
  }
};

export const createTestRepo = ({
  repo,
  templateRepo,
  gitProvider
}: {
  repo: string;
  templateRepo: string;
  gitProvider: GitProvider;
}) => {
  cy.visit('/menu');
  deleteRepo({ repo, gitProvider });
  if (gitProvider === 'gitlab') {
    cy.wait(10000);
  }
  createRepoFromTemplate({ repo, gitProvider, templateRepo });

  cy.get('[data-e2e-id="app"]').should('exist');
  cy.get('[data-e2e-id="add_repo_button"]').click();
  cy.get('[data-e2e-id="add_repo_import"]').click();
  cy.get('input[name="gitUrl"]').type(
    getRepoUrl({ fullName: `${getOwner(gitProvider)}/${repo}` }, gitProvider)
  );
  cy.get('button[type="submit"]').click();
  cy.loadingWithModal();
  cy.location('pathname').should('eq', '/repo');
};

export const deleteRepoFromMenu = ({
  repo,
  owner,
  gitProvider,
  shouldDeleteRepo = true
}: {
  repo: string;
  owner?: string;
  gitProvider: GitProvider;
  shouldDeleteRepo?: boolean;
}) => {
  const name = `${owner || getOwner(gitProvider)}/${repo}`;
  if (shouldDeleteRepo) deleteRepo({ repo, owner, gitProvider });
  cy.visit('/menu');
  cy.menuListLoading();
  cy.contains('[data-e2e-id="menu_repo_card"]', name)
    .find('button[aria-label="repo remove btn"]')
    .click();
  cy.get('button[data-e2e-id="delete_confirm"]:visible').click();
  cy.menuListLoading();
};

export const mockOAuth = (gitProvider: GitProvider) => {
  switch (gitProvider) {
    case 'github': {
      cy.window()
        .its('firebaseAuth')
        .then((firebaseAuth) => {
          cy.stub(firebaseAuth, 'signInWithPopup').returns({
            user: { uid: Cypress.env('CY_GITHUB_TEST_UID') }
          });
          cy.stub(
            firebaseAuth.GithubAuthProvider,
            'credentialFromResult'
          ).returns({
            accessToken: Cypress.env('CY_GITHUB_PAT')
          });
        });
      break;
    }
    case 'bitbucket': {
      cy.window()
        .its('firebaseAuth')
        .then((firebaseAuth) => {
          cy.stub(firebaseAuth, 'signInWithCustomToken').returns({
            user: { uid: Cypress.env('BITBUCKET_TEST_UID') }
          });
        });
      break;
    }
    case 'gitlab': {
      cy.window()
        .its('firebaseAuth')
        .then((firebaseAuth) => {
          cy.stub(firebaseAuth, 'signInWithCustomToken').returns({
            user: { uid: Cypress.env('GITLAB_TEST_UID') }
          });
        });
      break;
    }
  }
};

export const logout = () => {
  cy.window().then(() => {
    removeSessionStorage('access_token');
    removeSessionStorage('git_provider');
  });
  cy.logout();
};

export const login = (gitProvider: GitProvider) => {
  switch (gitProvider) {
    case 'github': {
      cy.login(Cypress.env('CY_GITHUB_TEST_UID'));
      cy.window().then(() => {
        setSessionStorage('access_token', Cypress.env('CY_GITHUB_PAT'));
        setSessionStorage('git_provider', 'github');
      });
      break;
    }
    case 'bitbucket': {
      cy.login(Cypress.env('BITBUCKET_TEST_UID'));
      cy.window().then(() => {
        setSessionStorage('access_token', Cypress.env('BITBUCKET_PAT'));
        setSessionStorage('git_provider', 'bitbucket');
      });
      break;
    }
    case 'gitlab': {
      cy.login(Cypress.env('GITLAB_TEST_UID'));
      cy.window().then(() => {
        setSessionStorage('access_token', Cypress.env('GITLAB_PAT'));
        setSessionStorage('git_provider', 'gitlab');
      });
      break;
    }
  }
  cy.wait(100);
};

export const getOwner = (gitProvider: GitProvider) => {
  switch (gitProvider) {
    case 'github': {
      return Cypress.env('CY_GITHUB_OWNER');
    }
    case 'bitbucket': {
      return Cypress.env('BITBUCKET_OWNER');
    }
    case 'gitlab': {
      return Cypress.env('GITLAB_OWNER');
    }
  }
};
