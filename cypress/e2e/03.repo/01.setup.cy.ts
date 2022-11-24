import { Octokit } from '@octokit/rest';

import RepoWording from '../../../public/locales/en/repo.json';
import { SETUP_CONFIG_COMMIT_MESSAGE } from '../../../src/page/Repo/constants';
import {
  createTestRepo,
  visitRepo,
  deleteAllTag,
  ERROR_MSG_CLASS,
  TOAST_CLASS,
  waitFor
} from '../../support/utils';

const octokit = new Octokit({ auth: Cypress.env('GITHUB_PAT') });

const SETUP_REPO_NAME = 'mock-setup-repo';
const SETUP_REPO_FULL_NAME = `${Cypress.env(
  'GITHUB_OWNER'
)}/${SETUP_REPO_NAME}`;

const clickOnRecentBranch = (branch: string) => {
  visitRepo(SETUP_REPO_FULL_NAME);
  cy.contains('[data-e2e-id="recent_branch"]', branch).click();
  cy.loadingWithModal();
  cy.get('[data-e2e-id="repo_setup"]').should('not.exist');
  cy.get('[data-e2e-id="repo"]').should('exist');
  cy.get('[data-e2e-id="save_editing_modal"]').should('not.exist');
};

const removeCreatedBranch = (branch: string) => {
  // Click on removed branch
  waitFor(() => {
    cy.wrap(
      octokit.rest.git.deleteRef({
        owner: Cypress.env('GITHUB_OWNER'),
        repo: SETUP_REPO_NAME,
        ref: `heads/${branch}`
      })
    );
  });
  visitRepo(SETUP_REPO_FULL_NAME);
  cy.contains('[data-e2e-id="recent_branch"]', branch).click();
  cy.loadingWithModal();
  cy.get('[data-e2e-id="repo_setup"]').should('exist');
  cy.get('[data-e2e-id="repo"]').should('not.exist');
  cy.contains(TOAST_CLASS, RepoWording['Branch not found']);
  cy.contains(branch).should('not.exist');
};

describe('setup repo', () => {
  before(() => {
    cy.loginWithGithub();
    createTestRepo(SETUP_REPO_NAME, 'mock-setup-repo-template');
  });

  after(() => {
    cy.visit('/menu');
    cy.menuListLoading();

    cy.contains('[data-e2e-id="menu_repo_card"]', SETUP_REPO_FULL_NAME)
      .find('button[aria-label="repo remove btn"]')
      .click();
    cy.get('button[data-e2e-id="delete_confirm"]:visible').click();
    cy.menuListLoading();
  });

  beforeEach(() => {
    visitRepo(SETUP_REPO_FULL_NAME);
    cy.get('[data-e2e-id="cookies_accept_button"]').click();
  });

  it('existing branch form required', () => {
    cy.get('button[type="submit"]').click();
    cy.get('input[name="existingBranchName"]:invalid').should('exist');
  });

  it('create new branch form required', () => {
    cy.get('[data-e2e-id="branch_action_create"]').click();
    cy.get('button[type="submit"]').click();
    cy.get('input[name="baseOn"]:invalid').should('exist');
    cy.get('input[name="newBranchName"]:invalid').should('exist');
  });

  it('config form required', () => {
    const branch = 'setup/config-form-required';
    cy.get('[data-e2e-id="branch_action_create"]').click();
    cy.get('input[name="baseOn"]').type('setup/02-branch-without-config');
    cy.get('input[name="newBranchName"]').type(branch);
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get('input[name="newBranchName"]').clear();
    cy.get('input[name="config.pattern"]').clear();
    deleteAllTag('config.languages');
    cy.get('button[type="submit"]').click();
    cy.get('input[name="newBranchName"]').should('exist');
    cy.get('input[name="config.pattern"]').should('exist');
    cy.get('input[data-e2e-id="config.languages-tag-input"]:invalid').should(
      'exist'
    );
  });

  it('config form test config', () => {
    const branch = 'setup/config-form-required';
    cy.get('[data-e2e-id="branch_action_create"]').click();
    cy.get('input[name="baseOn"]').type('setup/02-branch-without-config');
    cy.get('input[name="newBranchName"]').type(branch);
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();

    // language not exist
    deleteAllTag('config.languages');
    cy.get('input[data-e2e-id="config.languages-tag-input"]').type('qq{enter}');
    cy.get('[data-e2e-id="test_config_button"]').click();
    cy.get('[data-e2e-id="test_config_not_found"]', { timeout: 50000 }).should(
      'exist'
    );

    // pattern not correct
    deleteAllTag('config.languages');
    cy.get('input[data-e2e-id="config.languages-tag-input"]').type('en{enter}');
    cy.get('input[name="config.pattern"]').clear().type('public/:ns/:lng');
    cy.get('[data-e2e-id="test_config_button"]').click();
    cy.get('[data-e2e-id="test_config_not_found"]', { timeout: 50000 }).should(
      'exist'
    );
    cy.get('[data-e2e-id="test_config_namespace"]').should('not.exist');

    // get namespaces success
    cy.get('input[name="config.pattern"]').clear().type(':lng/:ns');
    cy.get('[data-e2e-id="test_config_button"]').click();
    cy.get('[data-e2e-id="test_config_namespace"]', { timeout: 50000 }).should(
      'have.length',
      2
    );
    cy.get('[data-e2e-id="test_config_namespace"]')
      .eq(0)
      .should('contain', 'translationA');
    cy.get('[data-e2e-id="test_config_namespace"]')
      .eq(1)
      .should('contain', 'translationB');
    cy.get('[data-e2e-id="test_config_not_found"]').should('not.exist');
  });

  it('use protected branch', () => {
    waitFor(() => {
      cy.wrap(
        octokit.rest.repos.updateBranchProtection({
          owner: Cypress.env('GITHUB_OWNER'),
          repo: SETUP_REPO_NAME,
          branch: 'main',
          required_pull_request_reviews: {},
          required_status_checks: { strict: false, contexts: [] },
          enforce_admins: true,
          restrictions: null
        })
      );
    });
    cy.get('input[name="existingBranchName"]').type('main');
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get(`input[name="existingBranchName"] + ${ERROR_MSG_CLASS}`).should(
      'contain',
      RepoWording['Protected branch not supported']
    );
  });

  it('use branch not exist', () => {
    cy.get('input[name="existingBranchName"]').type('iaushdislahd');
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get(`input[name="existingBranchName"] + ${ERROR_MSG_CLASS}`).should(
      'contain',
      RepoWording['Branch not found']
    );
  });

  it('create with branch not exist', () => {
    cy.get('[data-e2e-id="branch_action_create"]').click();
    cy.get('input[name="baseOn"]').type('iaushdislahd');
    cy.get('input[name="newBranchName"]').type('laskjdlkasjldas');
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get(`input[name="baseOn"] + ${ERROR_MSG_CLASS}`).should(
      'contain',
      RepoWording['Branch not found']
    );
  });

  it('create with duplicate branch name ( with config )', () => {
    cy.get('[data-e2e-id="branch_action_create"]').click();
    cy.get('input[name="baseOn"]').type('setup/01-branch-with-config');
    cy.get('input[name="newBranchName"]').type('main');
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get(`input[name="newBranchName"] + ${ERROR_MSG_CLASS}`).should(
      'contain',
      RepoWording['Branch already exists']
    );
  });

  it('create with duplicate branch name ( without config )', () => {
    cy.get('[data-e2e-id="branch_action_create"]').click();
    cy.get('input[name="baseOn"]').type('setup/02-branch-without-config');
    cy.get('input[name="newBranchName"]').type('main');
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get('[data-e2e-id="repo_setup_config"]').should('exist');
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get(`input[name="newBranchName"] + ${ERROR_MSG_CLASS}`).should(
      'contain',
      RepoWording['Branch already exists']
    );
  });

  it('use branch with config', () => {
    const branch = 'setup/01-branch-with-config';
    cy.get('input[name="existingBranchName"]').type(branch);
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get('[data-e2e-id="repo_setup"]').should('not.exist');
    cy.get('[data-e2e-id="repo"]').should('exist');
    cy.get('[data-e2e-id="save_editing_modal"]').should('not.exist');
    visitRepo(SETUP_REPO_FULL_NAME);
    cy.contains('[data-e2e-id="recent_branch"]', branch).should('exist');
  });

  it('create branch with config', () => {
    const branch = 'setup/create-branch-with-config';
    cy.get('[data-e2e-id="branch_action_create"]').click();
    cy.get('input[name="baseOn"]').type('setup/01-branch-with-config');
    cy.get('input[name="newBranchName"]').type(branch);
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get('[data-e2e-id="repo_setup"]').should('not.exist');
    cy.get('[data-e2e-id="repo"]').should('exist');
    cy.get('[data-e2e-id="save_editing_modal"]').should('not.exist');
    clickOnRecentBranch(branch);
    removeCreatedBranch(branch);
  });

  it('create branch without config', () => {
    const branch = 'setup/create-branch-without-config';
    cy.get('[data-e2e-id="branch_action_create"]').click();
    cy.get('input[name="baseOn"]').type('setup/02-branch-without-config');
    cy.get('input[name="newBranchName"]').type(branch);
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get('[data-e2e-id="repo"]').should('not.exist');
    cy.get('[data-e2e-id="repo_setup"]').should('exist');
    cy.get('button[type="submit"]').click();

    cy.loadingWithModal();
    cy.get('[data-e2e-id="save_editing_modal"]').should('exist');
    cy.get('input[name="commitMessage"]').should(
      'have.value',
      SETUP_CONFIG_COMMIT_MESSAGE
    );
    cy.get('button[type="submit"]').click();
    cy.get('[data-e2e-id="save_editing_modal"]', { timeout: 50000 }).should(
      'not.exist'
    );
    clickOnRecentBranch(branch);
    removeCreatedBranch(branch);
  });

  it('use existing branch without config', () => {
    const branch = 'setup/03-branch-for-create-config';
    cy.get('input[name="existingBranchName"]').type(branch);
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get('[data-e2e-id="repo"]').should('not.exist');
    cy.get('[data-e2e-id="repo_setup"]').should('exist');
    cy.get('button[type="submit"]').click();

    cy.loadingWithModal();
    cy.get('[data-e2e-id="save_editing_modal"]').should('exist');
    cy.get('input[name="commitMessage"]').should(
      'have.value',
      SETUP_CONFIG_COMMIT_MESSAGE
    );
    cy.get('button[type="submit"]').click();
    cy.get('[data-e2e-id="save_editing_modal"]', { timeout: 50000 }).should(
      'not.exist'
    );
    // Click on recent branch
    clickOnRecentBranch(branch);
  });

  it('use existing branch with custom path handler', () => {
    const branch = 'setup/04-branch-with-custom-path-handler';
    cy.get('input[name="existingBranchName"]').type(branch);
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get('[data-e2e-id="repo"]').should('exist');
    cy.get('[data-e2e-id="save_editing_modal"]').should('not.exist');
    // Click on recent branch
    clickOnRecentBranch(branch);
  });
});
