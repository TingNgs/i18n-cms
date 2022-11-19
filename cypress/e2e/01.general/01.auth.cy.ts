describe('auth', () => {
  it('visit menu when login', () => {
    cy.loginWithGithub();
    cy.visit('/menu');
    cy.location('pathname').should('eq', '/menu');
    cy.get('[data-e2e-id="add_repo_button"]').should('exist');
    cy.location('pathname').should('eq', '/menu');
    cy.get('[data-e2e-id="logout_button"]').first().click();
    cy.location('pathname', { timeout: 50000 }).should('eq', '/');
  });

  it('visit menu when logout', () => {
    cy.visit('/menu');
    cy.location('pathname').should('eq', '/');
  });
});
