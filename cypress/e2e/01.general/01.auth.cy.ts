describe('auth', () => {
  beforeEach(() => {
    cy.logout();
  });
  it('click login & logout button', () => {
    cy.visit('/');
    cy.window()
      .its('firebaseAuth')
      .then((firebaseAuth) => {
        cy.stub(firebaseAuth, 'signInWithPopup').returns({
          user: { uid: Cypress.env('TEST_UID') }
        });
        cy.stub(
          firebaseAuth.GithubAuthProvider,
          'credentialFromResult'
        ).returns({
          accessToken: Cypress.env('GITHUB_PAT')
        });
      });

    cy.get('[data-e2e-id="github_login_button"]').should('exist');
    cy.get('[data-e2e-id="github_login_button"]').first().click();
    cy.loginWithGithub();
    cy.location('pathname', { timeout: 50000 }).should('eq', '/menu');
    cy.visit('/');
    cy.get('[data-e2e-id="github_login_button"]').should('not.exist');

    cy.visit('/menu');
    cy.get('[data-e2e-id="logout_button"]').first().click();
    cy.location('pathname', { timeout: 50000 }).should('eq', '/');
  });

  it('visit menu when login', () => {
    cy.loginWithGithub();
    cy.visit('/menu');
    cy.location('pathname').should('eq', '/menu');
  });

  it('visit menu when logout', () => {
    cy.visit('/menu');
    cy.location('pathname').should('eq', '/');
  });

  it('visit repo when logout', () => {
    cy.visit('/repo');
    cy.location('pathname').should('eq', '/');
  });

  it('visit repo when login', () => {
    cy.loginWithGithub();
    cy.visit('/repo');
    cy.location('pathname').should('eq', '/menu');
  });

  it('visit page not existed', () => {
    cy.visit('/iasuhdiashud');
    cy.location('pathname').should('eq', '/');
  });
});
