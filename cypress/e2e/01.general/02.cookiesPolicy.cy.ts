describe('cookies policy', () => {
  beforeEach(() => {
    cy.window().then(() => {
      localStorage.setItem('i18nextLng', 'en');
    });
  });
  it('accept cookies policy', () => {
    cy.visit('/');
    cy.get('[data-e2e-id="cookies_accept_button"]').click();
    cy.get('[data-e2e-id="cookies_banner"]').should('not.exist');
    cy.reload();
    cy.get('[data-e2e-id="app"]').should('exist');
    cy.get('[data-e2e-id="cookies_banner"]').should('not.exist');
  });
  it('cancel cookies policy', () => {
    cy.visit('/');
    cy.get('[data-e2e-id="cookies_cancel_button"]').click();
    cy.reload();
    cy.get('[data-e2e-id="app"]').should('exist');
    cy.get('[data-e2e-id="cookies_banner"]').should('exist');
  });
});
