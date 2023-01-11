import CommonWordingEN from '../../../public/locales/en/common.json';
import CommonWordingZH from '../../../public/locales/zh/common.json';

describe('language selector', () => {
  beforeEach(() => {
    cy.window().then(() => {
      localStorage.setItem('i18nextLng', 'en');
    });
  });
  after(() => {
    cy.get('button[aria-label="language selector"]').click();
    cy.contains(
      '[data-e2e-id="language-selector-option"]',
      CommonWordingEN.en
    ).click();
  });
  it('change language', () => {
    cy.visit('/');
    cy.get('button[aria-label="language selector"]').click();
    cy.contains(
      '[data-e2e-id="language-selector-option"]',
      CommonWordingEN.zh
    ).click();
    cy.contains(CommonWordingZH.Documentation);

    cy.get('button[aria-label="language selector"]').click();
    cy.contains(
      '[data-e2e-id="language-selector-option"]',
      CommonWordingEN.en
    ).click();
    cy.contains(CommonWordingEN.Documentation);
  });
});
