import RepoWording from '../../../public/locales/en/repo.json';
import {
  createTestRepo,
  deleteRepoFromMenu,
  TOAST_CLASS,
  visitRepo
} from '../../support/utils';

const TABLE_REPO_NAME = 'mock-table-repo';
const TABLE_REPO_FULL_NAME = `${Cypress.env(
  'GITHUB_OWNER'
)}/${TABLE_REPO_NAME}`;

const checkDuplicated = (
  rows: { row: string; value: string }[],
  namespace: string,
  isValid: boolean
) => {
  rows.forEach(({ row, value }) => {
    cy.get(`[data-e2e-id="table_row"][data-index="${row}"]`).within(() => {
      cy.tableKeyType(value);
    });
  });

  rows.forEach(({ row }) => {
    cy.get(
      `[data-e2e-id="table_row"][data-index="${row}"] [data-e2e-id="key_error_icon"]`
    ).should(isValid ? 'not.exist' : 'exist');
  });

  cy.contains('[data-e2e-id="namespace"]', namespace)
    .find('[data-e2e-id="namespace_error_icon"]')
    .should(isValid ? 'not.exist' : 'exist');

  cy.get('button[data-e2e-id="save_button"]').click();
  if (isValid) {
    cy.get('[data-e2e-id="save_editing_modal"]').should('exist');
    cy.get(
      '[data-e2e-id="save_editing_modal"] button[aria-label="Close"]'
    ).click();
  } else {
    cy.get('[data-e2e-id="save_editing_modal"]').should('not.exist');
    cy.contains(
      TOAST_CLASS,
      RepoWording['Please remove all duplicated key']
    ).should('exist');
  }
};

describe('table', () => {
  before(() => {
    cy.loginWithGithub();
    createTestRepo(TABLE_REPO_NAME, 'mock-table-repo-template');
  });

  after(() => {
    deleteRepoFromMenu(TABLE_REPO_FULL_NAME);
  });
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-e2e-id="cookies_accept_button"]').click();
  });

  it('crud locales', () => {
    visitRepo(TABLE_REPO_FULL_NAME, '01/curd-locales');
    cy.get('[data-e2e-id="namespace"]').contains('translationA').click();
    cy.tableLoading();

    // add key and scroll to bottom
    cy.get('[data-e2e-id="new_key_button"]').click();
    cy.get('[data-e2e-id="table_row"][data-index="39"]')
      .should('exist')
      .within(() => {
        cy.tableKeyType('translationA_40');
        cy.tableCellType('en', 'hi');
        cy.tableCellType('zh', 'hi');
      });

    // add key after row 35
    cy.get('[data-e2e-id="table_row"][data-index="34"]').trigger('mouseenter');
    cy.get('[data-e2e-id="table_row"][data-index="34"]').trigger('mouseover');
    cy.get(
      '[data-e2e-id="table_row"][data-index="34"] button[aria-label="add locale after index"]'
    ).click();
    cy.get('[data-e2e-id="table_row"][data-index="34"]').trigger('mouseleave');
    cy.contains(
      '[data-e2e-id="table_row"][data-index="35"]',
      'translationA__key'
    ).within(() => {
      cy.tableKeyType('translationA_35-1');
      cy.tableCellType('en', 'hi');
      cy.tableCellType('zh', 'hi');
    });

    cy.save();
    visitRepo(TABLE_REPO_FULL_NAME, '01/curd-locales');
    cy.get('[data-e2e-id="namespace"]').contains('translationA').click();
    cy.tableLoading();

    // Check new locale exist
    cy.get('[data-e2e-id="table_container"]').scrollTo('bottom');
    cy.get(
      '[data-e2e-id="table_row"][data-index="35"] [data-e2e-id="table_key_cell"]'
    ).should('contain.text', 'translationA_35-1');
    cy.get(
      '[data-e2e-id="table_row"][data-index="40"] [data-e2e-id="table_key_cell"]'
    ).should('contain.text', 'translationA_40');

    // Delete locale
    cy.get(
      '[data-e2e-id="table_row"][data-index="35"] button[aria-label="delete locale"]'
    ).click();
    cy.get('[data-e2e-id="delete_confirm"]:visible').click();
    cy.contains(
      '[data-e2e-id="table_row"] [data-e2e-id="table_key_cell"]',
      'translationA_35-1'
    ).should('not.exist');
    cy.save();

    // Check locale deleted
    visitRepo(TABLE_REPO_FULL_NAME, '01/curd-locales');
    cy.get('[data-e2e-id="namespace"]').contains('translationA').click();
    cy.tableLoading();
    cy.get('[data-e2e-id="table_container"]').scrollTo('bottom');
    cy.get('[data-e2e-id="table_row"][data-index="39"]').should('exist');
    cy.get('[data-e2e-id="table_row"][data-index="40"]').should('not.exist');
    cy.contains(
      '[data-e2e-id="table_row"] [data-e2e-id="table_key_cell"]',
      'translationA_35-1'
    ).should('not.exist');
  });

  it('duplicated key', () => {
    visitRepo(TABLE_REPO_FULL_NAME, '02/duplicated-key');
    cy.get('[data-e2e-id="namespace"]').contains('translationA').click();
    cy.tableLoading();

    // translationA_01 && translationA_01
    checkDuplicated(
      [
        { row: '0', value: 'translationA_01' },
        { row: '1', value: 'translationA_01' }
      ],
      'translationA',
      false
    );

    // translationA_01 && translationA_01.nested_02
    checkDuplicated(
      [
        { row: '0', value: 'translationA_01' },
        { row: '1', value: 'translationA_01.nested_02' }
      ],
      'translationA',
      false
    );

    // translationA_01.nested_01 && translationA_01.nested_02
    checkDuplicated(
      [
        { row: '0', value: 'translationA_01.nested_01' },
        { row: '1', value: 'translationA_01.nested_02' }
      ],
      'translationA',
      true
    );

    // translationA_01.nested_01 && translationA_01.nested_01.0
    checkDuplicated(
      [
        { row: '0', value: 'translationA_01.nested_01' },
        { row: '1', value: 'translationA_01.nested_01.0' }
      ],
      'translationA',
      false
    );

    // translationA_01 && translationA_01.nested_01.0
    checkDuplicated(
      [
        { row: '0', value: 'translationA_01' },
        { row: '1', value: 'translationA_01.nested_01.0' }
      ],
      'translationA',
      false
    );
  });

  it('duplicated key (flatten)', () => {
    visitRepo(TABLE_REPO_FULL_NAME, '03/duplicated-key-flatten');
    cy.get('[data-e2e-id="namespace"]').contains('translationA').click();
    cy.tableLoading();

    // translationA_01 && translationA_01
    checkDuplicated(
      [
        { row: '0', value: 'translationA_01' },
        { row: '1', value: 'translationA_01' }
      ],
      'translationA',
      false
    );

    // translationA_01 && translationA_01.nested_02
    checkDuplicated(
      [
        { row: '0', value: 'translationA_01' },
        { row: '1', value: 'translationA_01.nested_02' }
      ],
      'translationA',
      true
    );

    // translationA_01.nested_01 && translationA_01.nested_02
    checkDuplicated(
      [
        { row: '0', value: 'translationA_01.nested_01' },
        { row: '1', value: 'translationA_01.nested_02' }
      ],
      'translationA',
      true
    );

    // translationA_01.nested_01 && translationA_01.nested_01.0
    checkDuplicated(
      [
        { row: '0', value: 'translationA_01.nested_01' },
        { row: '1', value: 'translationA_01.nested_01.0' }
      ],
      'translationA',
      true
    );

    // translationA_01 && translationA_01.nested_01.0
    checkDuplicated(
      [
        { row: '0', value: 'translationA_01' },
        { row: '1', value: 'translationA_01.nested_01.0' }
      ],
      'translationA',
      true
    );
  });
});
