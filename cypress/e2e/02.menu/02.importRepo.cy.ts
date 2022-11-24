import MenuWording from '../../../public/locales/en/menu.json';
import { ERROR_MSG_CLASS } from '../../support/utils';

import { IMPORT_REPO_FULL_NAME, IMPORT_REPO_URL } from './constants';

const REPO_WITH_NO_PERMISSION = 'https://github.com/TingNgs/i18n-cms-locales';
const REPO_NOT_EXIST = `https://github.com/${Cypress.env(
  'GITHUB_OWNER'
)}/afwioeuhfoawlenf`;
const INVALID_URL = 'iudfhsnaliodshf';

describe('import repo', () => {
  before(() => {
    cy.loginWithGithub();
  });
  beforeEach(() => {
    cy.visit('/menu');
    cy.get('[data-e2e-id="app"]').should('exist');
    cy.get('[data-e2e-id="add_repo_button"]').click();
    cy.get('[data-e2e-id="add_repo_import"]').click();
  });

  it('test required field', () => {
    cy.get('button[type="submit"]').click();
    cy.get('input[name="githubUrl"]:invalid').should('exist');
  });

  it('test invalid url', () => {
    cy.get('input[name="githubUrl"]').type(INVALID_URL);
    cy.get('button[type="submit"]').click();
    cy.get('input[name="githubUrl"][aria-invalid="true"]').should('exist');
    cy.get(`input[name="githubUrl"] + ${ERROR_MSG_CLASS}`).should(
      'have.text',
      MenuWording['Invalid github url']
    );
  });

  it('test repo not exist', () => {
    cy.get('input[name="githubUrl"]').type(REPO_NOT_EXIST);
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get('input[name="githubUrl"][aria-invalid="true"]').should('exist');
    cy.get(`input[name="githubUrl"] + ${ERROR_MSG_CLASS}`).should(
      'have.text',
      MenuWording['Repository not found']
    );
  });

  it('test repo without permission', () => {
    cy.get('input[name="githubUrl"]').type(REPO_WITH_NO_PERMISSION);
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.get('input[name="githubUrl"][aria-invalid="true"]').should('exist');
    cy.get(`input[name="githubUrl"] + ${ERROR_MSG_CLASS}`).should(
      'have.text',
      MenuWording['Without push permission in this repo']
    );
  });

  it('test import repo success', () => {
    cy.get('input[name="githubUrl"]').type(IMPORT_REPO_URL);
    cy.get('button[type="submit"]').click();
    cy.loadingWithModal();
    cy.location('pathname').should('eq', '/repo');
    cy.visit('/menu');
    cy.contains('[data-e2e-id="menu_repo_card"]', IMPORT_REPO_FULL_NAME)
      .find('button[aria-label="repo remove btn"]')
      .click();

    cy.get('button[data-e2e-id="delete_confirm"]:visible').click();
    cy.menuListLoading();
    cy.contains(IMPORT_REPO_FULL_NAME).should('not.exist');
  });
});
