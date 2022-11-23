import { mount } from 'cypress/react18';

declare global {
  namespace Cypress {
    interface Chainable {
      loginWithGithub(): Chainable<Element>;
      loadingWithModal(): Chainable<Element>;
      menuListLoading(): Chainable<Element>;
      tableLoading(): Chainable<Element>;
      tableCellType(language: string, value: string): Chainable<Element>;
      save(commitMessage?: string): Chainable<Element>;
      mount: typeof mount;
    }
  }
}
