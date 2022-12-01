import RepoWording from '../../../public/locales/en/repo.json';
import {
  createTestRepo,
  deleteRepoFromMenu,
  ERROR_MSG_CLASS,
  visitRepo
} from '../../support/utils';

const NAMESPACES_REPO_NAME = 'mock-namespaces-repo';
const NAMESPACES_REPO_FULL_NAME = `${Cypress.env(
  'GITHUB_OWNER'
)}/${NAMESPACES_REPO_NAME}`;

const checkNamespace = (namespace: string) => {
  cy.wait(10);
  cy.get('[data-e2e-id="namespace"]').contains(namespace).click();
  cy.get('[data-e2e-id="namespace"][aria-selected="true"]').should(
    'have.text',
    namespace
  );
  cy.tableLoading();
  cy.contains(`${namespace}__key__`).should('exist');
};

const checkNamespaces = (namespaces: string[]) => {
  cy.get('[data-e2e-id="namespace"]').should('have.length', namespaces.length);
  cy.get('[data-e2e-id="namespace"][aria-selected="false"]').should(
    'have.length',
    namespaces.length
  );
  namespaces.forEach((namespace, index) => {
    cy.get('[data-e2e-id="namespace"]')
      .eq(index)
      .should('have.text', namespace)
      .then(() => {
        checkNamespace(namespace);
      });
  });
};

const testAddNamespace = (namespace: string, branch: string) => {
  cy.get('[data-e2e-id="new_namespace_button"]').click();
  cy.get('[data-e2e-id="new_namespace_input"]:visible').type(namespace);
  cy.get('[data-e2e-id="new_namespace_submit"]:visible').click();
  cy.get('[data-e2e-id="namespace"][aria-selected="true"]').should(
    'have.text',
    namespace
  );
  cy.contains(`${namespace}__key__`).should('exist');
  cy.tableCellType('en', `${namespace}_en`);
  cy.tableCellType('zh', `${namespace}_zh`);
  cy.save();

  visitRepo(NAMESPACES_REPO_FULL_NAME, branch);
  checkNamespace(namespace);
};

const testDeleteNamespace = (namespace: string, branch: string) => {
  cy.contains('[data-e2e-id="namespace"]', namespace).click();
  cy.get('[aria-label="namespace actions"]').click();
  cy.get('[data-e2e-id="delete_namespace_button"]').click();
  cy.get('[data-e2e-id="delete_confirm"]:visible').click();
  cy.contains('[data-e2e-id="namespace"]', namespace).should('not.exist');
  cy.get('[data-e2e-id="namespace"][aria-selected="true"]').should('not.exist');
  cy.save();
  visitRepo(NAMESPACES_REPO_FULL_NAME, branch);
  cy.contains('[data-e2e-id="namespace"]', namespace).should('not.exist');
};

describe('namespaces', () => {
  before(() => {
    cy.loginWithGithub();
    createTestRepo(NAMESPACES_REPO_NAME, 'mock-namespaces-repo-template');
  });

  after(() => {
    deleteRepoFromMenu(NAMESPACES_REPO_FULL_NAME);
  });
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-e2e-id="cookies_accept_button"]').click();
  });

  it('default file path', () => {
    const branch = '01/default-file-path';
    visitRepo(NAMESPACES_REPO_FULL_NAME, branch);
    checkNamespaces(['translationA', 'translationB', 'translationC']);
    testAddNamespace('translationD', branch);
    testDeleteNamespace('translationB', branch);
  });

  it('file path with prefix', () => {
    const branch = '02/file-path-with-prefix';
    visitRepo(NAMESPACES_REPO_FULL_NAME, branch);
    checkNamespaces(['translationA', 'translationB', 'translationC']);
    testAddNamespace('translationD', branch);
    testDeleteNamespace('translationB', branch);
  });

  it('custom path handler', () => {
    const branch = '03/custom-file-path-handler';
    visitRepo(NAMESPACES_REPO_FULL_NAME, branch);
    checkNamespaces(['common', 'translationA', 'translationB', 'translationC']);
    testAddNamespace('translationD', branch);
    testDeleteNamespace('translationB', branch);
  });

  it('add repeated namespace', () => {
    const namespace = 'translationA';
    visitRepo(NAMESPACES_REPO_FULL_NAME, '04/add-repeated-namespace');
    checkNamespace(namespace);
    cy.get('[data-e2e-id="new_namespace_button"]').click();
    cy.get('[data-e2e-id="new_namespace_input"]:visible').type(namespace);
    cy.get('[data-e2e-id="new_namespace_submit"]:visible').click();
    cy.contains(
      `[data-e2e-id="new_namespace_input"][aria-invalid="true"]:visible + ${ERROR_MSG_CLASS}`,
      RepoWording['Namespace already exist']
    ).should('exist');
  });
});
