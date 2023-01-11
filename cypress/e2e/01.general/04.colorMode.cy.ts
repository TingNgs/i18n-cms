describe('color mode', () => {
  beforeEach(() => {
    cy.window().then(() => {
      localStorage.setItem('i18nextLng', 'en');
    });
  });
  it('change language', () => {
    cy.window().then(() => {
      localStorage.setItem('chakra-ui-color-mode', 'dark');
    });
    cy.visit('/');
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    cy.get('button[aria-label="color mode button"]').click();
    cy.get('html').should('have.attr', 'data-theme', 'light');
    cy.get('button[aria-label="color mode button"]').click();
    cy.get('html').should('have.attr', 'data-theme', 'dark');
  });
});
