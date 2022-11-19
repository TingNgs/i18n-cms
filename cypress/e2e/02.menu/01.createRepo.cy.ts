import { Octokit } from '@octokit/rest';
import {
  deleteAllTag,
  ERROR_MSG_CLASS,
  TOAST_CLASS,
  waitFor
} from '../../support/utils';
import MenuWording from '../../../public/locales/en/menu.json';
import {
  CREATE_REPO_FULL_NAME,
  CREATE_REPO_NAME,
  IMPORT_REPO_NAME
} from './constants';

const octokit = new Octokit({ auth: Cypress.env('GITHUB_PAT') });

describe('create repo', () => {
  before(() => {
    cy.loginWithGithub();
  });
  beforeEach(() => {
    cy.visit('/menu');
    cy.get('[data-e2e-id="app"]').should('exist');
    cy.get('[data-e2e-id="add_repo_button"]').click();
    cy.get('[data-e2e-id="add_repo_create"]').click();
  });

  it('test required field', () => {
    deleteAllTag('languages');
    deleteAllTag('namespaces');
    cy.get('input[name="pattern"]').clear();
    cy.get('button[type="submit"]', { timeout: 50000 }).should('be.enabled');
    cy.get('button[type="submit"]').click();
    cy.get('input[name="name"]:invalid').should('exist');
    cy.get('input[name="pattern"]:invalid').should('exist');
    cy.get('select[name="defaultLanguage"]:invalid').should('exist');
    cy.get('input[data-e2e-id="languages-tag-input"]:invalid').should('exist');
    cy.get('input[data-e2e-id="namespaces-tag-input"]:invalid').should('exist');
  });

  it('test create repo', () => {
    cy.get('input[name="name"]').type(CREATE_REPO_NAME);
    cy.get('button[type="submit"]', { timeout: 50000 }).should('be.enabled');
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.location('pathname', { timeout: 50000 }).should('eq', '/repo');

    // Click existing repo
    cy.visit('/menu');
    cy.get('[data-e2e-id="menu_repo_card"]').contains(CREATE_REPO_NAME).click();
    cy.loadingWithModal();
    cy.location('pathname', { timeout: 50000 }).should('eq', '/repo');

    // Click removed repo
    cy.visit('/menu');
    cy.menuListLoading();
    waitFor(() => {
      cy.wrap(
        octokit.rest.repos.delete({
          owner: Cypress.env('GITHUB_OWNER'),
          repo: CREATE_REPO_NAME
        })
      );
    });
    cy.get('[data-e2e-id="menu_repo_card"]')
      .contains(CREATE_REPO_FULL_NAME)
      .click();
    cy.loadingWithModal();
    cy.get(TOAST_CLASS).should(
      'contain.text',
      MenuWording['Please import repo again']
    );
    cy.menuListLoading();
    cy.contains(CREATE_REPO_FULL_NAME).should('not.exist');
  });

  it('test create repo repeated', () => {
    cy.get('input[name="name"]').type(IMPORT_REPO_NAME);
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get('input[name="name"][aria-invalid="true"]').should('exist');
    cy.get(
      `input[name="name"][aria-invalid="true"] + ${ERROR_MSG_CLASS}`
    ).should(
      'have.text',
      MenuWording['Repository name already exists on this owner']
    );
  });
});
