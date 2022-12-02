import RepoWording from '../../../public/locales/en/repo.json';
import {
  createTestRepo,
  deleteRepoFromMenu,
  ERROR_MSG_CLASS,
  gitProviders,
  login,
  visitRepo
} from '../../support/utils';

const LANGUAGES_REPO_NAME = 'mock-languages-repo';
const LANGUAGES_REPO_FULL_NAME = `${Cypress.env(
  'GITHUB_OWNER'
)}/${LANGUAGES_REPO_NAME}`;

const checkLanguages = (languages: string[]) => {
  cy.get('[data-e2e-id="language"]').should('have.length', languages.length);
  languages.forEach((language) => {
    cy.contains('[data-e2e-id="language"]', language)
      .should('exist')
      .find('button[aria-label="toggle language"]')
      .then((button) => {
        const isLanguageVisible = button[0].dataset.visible === 'true';
        cy.contains(
          '[data-e2e-id="table_head"] [data-e2e-id="table_cell"]',
          language
        ).should(isLanguageVisible ? 'exist' : 'not.exist');
      });
  });
};

const checkLanguageOrder = (language: string, index: number) => {
  cy.get('[data-e2e-id="language"]').eq(index).should('have.text', language);
  cy.get('[data-e2e-id="table_head"] [data-e2e-id="table_cell"]')
    .eq(index + 1)
    .should('have.text', language);
};

gitProviders.map((gitProvider) => {
  describe(`languages - ${gitProvider}`, () => {
    before(() => {
      login(gitProvider);
      createTestRepo({
        repo: LANGUAGES_REPO_NAME,
        templateRepo: 'mock-languages-repo-template',
        gitProvider
      });
    });

    after(() => {
      deleteRepoFromMenu(LANGUAGES_REPO_FULL_NAME);
    });
    beforeEach(() => {
      cy.visit('/');
      cy.get('[data-e2e-id="cookies_accept_button"]').click();
    });

    it('crud language', () => {
      visitRepo(LANGUAGES_REPO_FULL_NAME, '01/crud-language');
      cy.get('[data-e2e-id="namespace"]').contains('translationA').click();
      cy.tableLoading();
      cy.get('[data-e2e-id="languages_accordion_button"]').click();
      checkLanguages(['en', 'zh']);

      cy.get('[data-e2e-id="new_language_button"]').click();
      cy.get('[data-e2e-id="new_language_input"]').type('de');
      cy.get('[data-e2e-id="new_language_submit"]:visible').click();
      checkLanguages(['en', 'zh', 'de']);
      cy.get('[data-e2e-id="namespace"]').contains('translationB').click();
      checkLanguages(['en', 'zh', 'de']);
      cy.save();

      visitRepo(LANGUAGES_REPO_FULL_NAME, '01/crud-language');
      cy.get('[data-e2e-id="namespace"]').contains('translationA').click();
      cy.tableLoading();
      cy.get('[data-e2e-id="languages_accordion_button"]').click();
      checkLanguages(['en', 'zh', 'de']);
      cy.contains('[data-e2e-id="language"]', 'zh')
        .find('[aria-label="delete language"]')
        .click();
      cy.get('button[data-e2e-id="delete_confirm"]:visible').click();
      checkLanguages(['en', 'de']);
      cy.save();

      visitRepo(LANGUAGES_REPO_FULL_NAME, '01/crud-language');
      cy.get('[data-e2e-id="namespace"]').contains('translationA').click();
      cy.tableLoading();
      cy.get('[data-e2e-id="languages_accordion_button"]').click();
      checkLanguages(['en', 'de']);
    });

    it('add repeated language', () => {
      const language = 'en';
      visitRepo(LANGUAGES_REPO_FULL_NAME, '02/add-repeated-language');
      cy.get('[data-e2e-id="languages_accordion_button"]').click();
      cy.contains('[data-e2e-id="language"]', language).should('exist');
      cy.get('[data-e2e-id="new_language_button"]').click();
      cy.get('[data-e2e-id="new_language_input"]').type(language);
      cy.get('[data-e2e-id="new_language_submit"]:visible').click();
      cy.contains(
        `[data-e2e-id="new_language_input"][aria-invalid="true"] + ${ERROR_MSG_CLASS}`,
        RepoWording['Language already exist']
      ).should('exist');
    });

    it('language visibility', () => {
      const languages = ['en', 'zh'];
      visitRepo(LANGUAGES_REPO_FULL_NAME, '03/language-visibility');
      cy.get('[data-e2e-id="namespace"]').contains('translationA').click();
      cy.tableLoading();
      cy.get('[data-e2e-id="languages_accordion_button"]').click();

      checkLanguages(languages);
      languages.map((language, index) => {
        cy.contains('[data-e2e-id="language"]', language)
          .find('button[aria-label="toggle language"]')
          .click();
        cy.contains('[data-e2e-id="language"]', language)
          .find('button[aria-label="toggle language"]')
          .should('have.attr', 'data-visible', 'false');
        checkLanguages(languages);
        cy.get('button[aria-label="show all language"]').should(
          'have.attr',
          'data-visible',
          index === languages.length - 1 ? 'false' : 'true'
        );
      });

      cy.get('button[aria-label="show all language"]').click();
      languages.map((language) => {
        cy.contains('[data-e2e-id="language"]', language)
          .find('button[aria-label="toggle language"]')
          .should('have.attr', 'data-visible', 'true');
      });
      cy.get('button[aria-label="show all language"]').should(
        'have.attr',
        'data-visible',
        'true'
      );
      checkLanguages(languages);

      cy.get('button[aria-label="show all language"]').click();
      languages.map((language) => {
        cy.contains('[data-e2e-id="language"]', language)
          .find('button[aria-label="toggle language"]')
          .should('have.attr', 'data-visible', 'false');
      });
      cy.get('button[aria-label="show all language"]').should(
        'have.attr',
        'data-visible',
        'false'
      );
      checkLanguages(languages);
    });

    it('reorder language', () => {
      visitRepo(LANGUAGES_REPO_FULL_NAME, '04/reorder-languages');
      cy.get('[data-e2e-id="namespace"]').contains('translationA').click();
      cy.tableLoading();
      cy.get('[data-e2e-id="languages_accordion_button"]').click();
      ['en', 'zh', 'de', 'vi'].forEach(checkLanguageOrder);

      cy.reorderList(
        '[data-e2e-id="language"] [data-e2e-id="drag_handler"]',
        0,
        1
      );
      ['zh', 'en', 'de', 'vi'].forEach(checkLanguageOrder);

      cy.reorderList(
        '[data-e2e-id="language"] [data-e2e-id="drag_handler"]',
        3,
        -3
      );
      ['vi', 'zh', 'en', 'de'].forEach(checkLanguageOrder);
    });
  });
});
