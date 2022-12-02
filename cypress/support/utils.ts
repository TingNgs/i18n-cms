import { Bitbucket } from 'bitbucket';
import { Octokit } from '@octokit/rest';
import { noop } from 'lodash-es';
import { setSessionStorage } from '../../src/utils/storage';
import { getRepoUrl } from '../../src/utils';

const octokit = new Octokit({ auth: Cypress.env('GITHUB_PAT') });
const bitbucket = new Bitbucket({
  notice: false,
  auth: {
    password: Cypress.env('BITBUCKET_PAT'),
    username: Cypress.env('BITBUCKET_OWNER')
  }
});

export const ERROR_MSG_CLASS = '.chakra-form__error-message';
export const TOAST_CLASS = '.chakra-toast';
export const gitProviders = ['github', 'bitbucket'] as const;
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
      waitFor(() => {
        cy.wrap(
          octokit.rest.repos.updateBranchProtection({
            owner: owner || getOwner('github'),
            repo,
            branch,
            required_pull_request_reviews: {},
            required_status_checks: { strict: false, contexts: [] },
            enforce_admins: true,
            restrictions: null
          })
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
  createRepoFromTemplate({ repo, gitProvider, templateRepo });

  cy.get('[data-e2e-id="app"]').should('exist');
  cy.get('[data-e2e-id="add_repo_button"]').click();
  cy.get('[data-e2e-id="add_repo_import"]').click();
  cy.get('input[name="gitUrl"]').type(
    getRepoUrl({ fullName: `${getOwner(gitProvider)}/${repo}` })
  );
  cy.get('button[type="submit"]').click();
  cy.loadingWithModal();
  cy.location('pathname').should('eq', '/repo');
};

export const deleteRepoFromMenu = (name: string) => {
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
            user: { uid: Cypress.env('GITHUB_TEST_UID') }
          });
          cy.stub(
            firebaseAuth.GithubAuthProvider,
            'credentialFromResult'
          ).returns({
            accessToken: Cypress.env('GITHUB_PAT')
          });
        });
      break;
    }
    case 'bitbucket': {
      cy.intercept('POST', '**/bitbucket', {
        body: {
          access_token: '',
          scopes: 'account repository:admin team repository:write',
          token_type: 'bearer',
          expires_in: 7200,
          state: 'authorization_code',
          refresh_token: 'mock_refresh_token',
          token: 'mock_custom_token'
        }
      });
      cy.window()
        .its('firebaseAuth')
        .then((firebaseAuth) => {
          cy.stub(firebaseAuth, 'signInWithCustomToken').returns({
            user: { uid: Cypress.env('BITBUCKET_TEST_UID') }
          });
        });
      break;
    }
  }
};

export const login = (gitProvider: GitProvider) => {
  switch (gitProvider) {
    case 'github': {
      cy.login(Cypress.env('GITHUB_TEST_UID'));
      cy.window().then(() => {
        setSessionStorage('access_token', Cypress.env('GITHUB_PAT'));
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
  }
};

export const getOwner = (gitProvider: GitProvider) => {
  switch (gitProvider) {
    case 'github': {
      return Cypress.env('GITHUB_OWNER');
    }
    case 'bitbucket': {
      return Cypress.env('BITBUCKET_OWNER');
    }
  }
};
