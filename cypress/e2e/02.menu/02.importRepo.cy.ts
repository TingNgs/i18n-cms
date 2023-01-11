import MenuWording from '../../../public/locales/en/menu.json';
import { getRepoUrl } from '../../../src/utils';
import {
  deleteRepoFromMenu,
  ERROR_MSG_CLASS,
  getOwner,
  gitProviders,
  login,
  logout
} from '../../support/utils';

gitProviders.map((gitProvider) => {
  const REPO_WITH_NO_PERMISSION = getRepoUrl(
    {
      fullName: 'i18n-cms/i18n-cms-locales'
    },
    gitProvider
  );
  const REPO_NOT_EXIST = getRepoUrl(
    {
      fullName: `${getOwner(gitProvider)}/afwioeuhfoawlenf`
    },
    gitProvider
  );
  const INVALID_URL = 'iudfhsnaliodshf';
  describe(`import repo - ${gitProvider}`, () => {
    before(() => {
      login(gitProvider);
    });
    beforeEach(() => {
      cy.window().then(() => {
        localStorage.setItem('i18nextLng', 'en');
      });
      cy.visit('/menu');
      cy.get('[data-e2e-id="app"]').should('exist');
      cy.get('[data-e2e-id="add_repo_button"]').click();
      cy.get('[data-e2e-id="add_repo_import"]').click();
    });

    after(() => {
      logout();
    });

    it('test required field', () => {
      cy.get('button[type="submit"]').click();
      cy.get('input[name="gitUrl"]:invalid').should('exist');
    });

    it('test invalid url', () => {
      cy.get('input[name="gitUrl"]').type(INVALID_URL);
      cy.get('button[type="submit"]').click();
      cy.get('input[name="gitUrl"][aria-invalid="true"]').should('exist');
      cy.get(`input[name="gitUrl"] + ${ERROR_MSG_CLASS}`).should(
        'have.text',
        MenuWording['Invalid url']
      );
    });

    it('test repo not exist', () => {
      cy.get('input[name="gitUrl"]').type(REPO_NOT_EXIST);
      cy.get('button[type="submit"]').click();
      cy.loadingWithModal();
      cy.get('input[name="gitUrl"][aria-invalid="true"]').should('exist');
      cy.get(`input[name="gitUrl"] + ${ERROR_MSG_CLASS}`).should(
        'have.text',
        MenuWording['Repository not found']
      );
    });

    it('test repo without permission', () => {
      cy.get('input[name="gitUrl"]').type(REPO_WITH_NO_PERMISSION);
      cy.get('button[type="submit"]').click();
      cy.loadingWithModal();
      cy.get('input[name="gitUrl"][aria-invalid="true"]').should('exist');
      cy.get(`input[name="gitUrl"] + ${ERROR_MSG_CLASS}`).should(
        'have.text',
        MenuWording['Without push permission in this repo']
      );
    });

    it('test import repo success', () => {
      const IMPORT_REPO_NAME = 'mock-import-repo';
      const IMPORT_REPO_FULL_NAME = `${getOwner(
        gitProvider
      )}/${IMPORT_REPO_NAME}`;
      const IMPORT_REPO_URL = getRepoUrl(
        { fullName: IMPORT_REPO_FULL_NAME },
        gitProvider
      );

      cy.get('input[name="gitUrl"]').type(IMPORT_REPO_URL);
      cy.get('button[type="submit"]').click();
      cy.loadingWithModal();
      cy.location('pathname').should('eq', '/repo');
      deleteRepoFromMenu(IMPORT_REPO_FULL_NAME);
    });
  });
});
