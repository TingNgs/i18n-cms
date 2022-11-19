export const deleteAllTag = (e2eTitle: string) => {
  cy.get('body').then(($body) => {
    for (
      let i = $body.find(`[data-e2e-id="${e2eTitle}-tag"] button`).length;
      i > 0;
      i--
    ) {
      cy.get(`[data-e2e-id="${e2eTitle}-tag"] button`).first().click();
    }
  });
};

export const waitFor = (cb: () => void) => {
  cy.get('[data-e2e-id="app"]').should('exist').then(cb);
};

export const ERROR_MSG_CLASS = '.chakra-form__error-message';
export const TOAST_CLASS = '.chakra-toast';
