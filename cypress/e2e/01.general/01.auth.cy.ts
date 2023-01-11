import { gitProviders, login, logout, mockOAuth } from '../../support/utils';

describe(`auth`, () => {
  beforeEach(() => {
    cy.window().then(() => {
      localStorage.setItem('i18nextLng', 'en');
    });

    logout();
  });

  it('visit menu when logout', () => {
    cy.visit('/menu');
    cy.location('pathname').should('eq', '/');
  });

  it('visit repo when logout', () => {
    cy.visit('/repo');
    cy.location('pathname').should('eq', '/');
  });

  it('visit page not existed', () => {
    cy.visit('/iasuhdiashud');
    cy.location('pathname').should('eq', '/');
  });

  gitProviders.map((gitProvider) => {
    describe(`auth - ${gitProvider}`, () => {
      it('click login & logout button', () => {
        cy.visit('/');
        mockOAuth(gitProvider);
        const loginButton = `[data-e2e-id="${gitProvider}_login_button"]`;
        cy.get('[data-e2e-id="login_button"]').first().click();
        cy.get(loginButton).should('exist').click();
        login(gitProvider);
        cy.location('pathname', { timeout: 50000 }).should('eq', '/menu');
        cy.visit('/');
        cy.get(loginButton).should('not.exist');

        cy.visit('/menu');
        cy.get('[data-e2e-id="logout_button"]').click();
        cy.location('pathname', { timeout: 50000 }).should('eq', '/');
      });

      it('visit menu when login', () => {
        login(gitProvider);
        cy.visit('/menu');
        cy.location('pathname').should('eq', '/menu');
      });

      it('visit repo when login', () => {
        login(gitProvider);
        cy.visit('/repo');
        cy.location('pathname').should('eq', '/menu');
      });
    });
  });
});
