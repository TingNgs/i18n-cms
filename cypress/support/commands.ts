/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';
import { attachCustomCommands } from 'cypress-firebase';

const fbConfig = {
  apiKey: Cypress.env('FIREBASE_API_KEY'),
  authDomain: Cypress.env('FIREBASE_AUTH_DOMAIN'),
  projectId: Cypress.env('FIREBASE_PROJECT_ID'),
  storageBucket: Cypress.env('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: Cypress.env('FIREBASE_MESSAGING_SENDER_ID'),
  appId: Cypress.env('FIREBASE_APP_ID'),
  measurementId: Cypress.env('FIREBASE_MEASUREMENT_ID')
};

firebase.initializeApp(fbConfig);

attachCustomCommands({ Cypress, cy, firebase });

Cypress.Commands.add('loginWithGithub', () => {
  cy.login();
  cy.window().then(() => {
    sessionStorage.setItem('github_access_token', Cypress.env('GITHUB_PAT'));
  });
});

Cypress.Commands.add('loadingWithModal', () => {
  cy.get('[data-e2e-id="loading_modal"]').should('exist');
  cy.get('[data-e2e-id="loading_modal"]', { timeout: 50000 }).should(
    'not.exist'
  );
});

Cypress.Commands.add('menuListLoading', () => {
  cy.get('[data-e2e-id="menu_list_skeleton"]', { timeout: 50000 }).should(
    'exist'
  );
  cy.get('[data-e2e-id="menu_list_skeleton"]', { timeout: 50000 }).should(
    'not.exist'
  );
});

Cypress.Commands.add('tableLoading', () => {
  cy.get('[data-e2e-id="table_spinner"]', { timeout: 50000 }).should('exist');
  cy.get('[data-e2e-id="table_spinner"]', { timeout: 50000 }).should(
    'not.exist'
  );
});

Cypress.Commands.add('tableCellType', (language, value) => {
  cy.get(
    `[data-e2e-id="table_cell"][data-language="${language}"] [aria-label="Edit"][type="button"]`
  ).click();
  cy.get(
    `[data-e2e-id="table_cell"][data-language="${language}"] textarea`
  ).type(value);
});

Cypress.Commands.add('save', (commitMessage) => {
  cy.get('[data-e2e-id="save_button"]').click();
  if (commitMessage) {
    cy.get('input[name="commitMessage"]').type(commitMessage);
  }
  cy.get('[data-e2e-id="save_editing_modal"] button[type="submit"]').click();
  cy.get('[data-e2e-id="save_editing_modal"]', { timeout: 50000 }).should(
    'not.exist'
  );
});
