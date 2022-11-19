declare namespace Cypress {
  interface Chainable {
    loginWithGithub(): Chainable<Element>;
    loadingWithModal(): Chainable<Element>;
    menuListLoading(): Chainable<Element>;
  }
}
