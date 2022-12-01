import { Octokit } from '@octokit/rest';
import { noop } from 'lodash-es';
const octokit = new Octokit({ auth: Cypress.env('GITHUB_PAT') });

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

export const createTestRepo = (repo: string, templateRepo: string) => {
  cy.visit('/menu');
  waitFor(() => {
    cy.wrap(
      octokit.rest.repos
        .delete({
          owner: Cypress.env('GITHUB_OWNER'),
          repo: repo
        })
        .catch(noop)
    );
  });
  waitFor(() => {
    cy.wrap(
      octokit.rest.repos.createUsingTemplate({
        owner: Cypress.env('GITHUB_OWNER'),
        name: repo,
        template_owner: Cypress.env('GITHUB_OWNER'),
        template_repo: templateRepo,
        include_all_branches: true
      })
    );
  });
  cy.get('[data-e2e-id="app"]').should('exist');
  cy.get('[data-e2e-id="add_repo_button"]').click();
  cy.get('[data-e2e-id="add_repo_import"]').click();
  cy.get('input[name="gitUrl"]').type(
    `https://github.com/${Cypress.env('GITHUB_OWNER')}/${repo}`
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

export const ERROR_MSG_CLASS = '.chakra-form__error-message';
export const TOAST_CLASS = '.chakra-toast';
