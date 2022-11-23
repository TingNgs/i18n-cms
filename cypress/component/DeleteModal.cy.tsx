import { noop } from 'lodash-es';

import DeleteModal from '../../src/component/DeleteModal';

const defaultProps = {
  isOpen: true,
  onClose: noop,
  onConfirm: noop
};

describe('DeleteModal.cy.ts', () => {
  it('isOpen', () => {
    cy.mount(<DeleteModal {...defaultProps} isOpen={false} />);
    cy.get('[data-e2e-id="delete_modal"]').should('not.exist');
    cy.mount(<DeleteModal {...defaultProps} />);
    cy.get('[data-e2e-id="delete_modal"]').should('exist');
  });
  it('onCancel', () => {
    const onCloseSpy = cy.spy().as('onCloseSpy');
    cy.mount(<DeleteModal {...defaultProps} onClose={onCloseSpy} />);
    cy.get('[data-e2e-id="delete_cancel"]').click();
    cy.get('@onCloseSpy').should('be.calledOnce');
  });

  it('onConfirm', () => {
    const onConfirm = cy.spy().as('onConfirmSpy');
    cy.mount(<DeleteModal {...defaultProps} onConfirm={onConfirm} />);
    cy.get('[data-e2e-id="delete_confirm"]').click();
    cy.get('@onConfirmSpy').should('be.calledOnce');
  });

  it('isLoading', () => {
    cy.mount(<DeleteModal {...defaultProps} isLoading />);
    cy.get('[data-e2e-id="delete_confirm"]')
      .should('be.disabled')
      .should('have.attr', 'data-loading');
  });

  it('title and content', () => {
    const title = 'title';
    const content = 'content';
    cy.mount(<DeleteModal {...defaultProps} title={title} content={content} />);
    cy.contains(title).should('exist');
    cy.contains(content).should('exist');
  });
});
