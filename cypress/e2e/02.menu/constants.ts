export const CREATE_REPO_NAME = 'mock-create-repo';
export const CREATE_REPO_FULL_NAME = `${Cypress.env(
  'GITHUB_OWNER'
)}/${CREATE_REPO_NAME}`;

export const IMPORT_REPO_NAME = 'mock-import-repo';
export const IMPORT_REPO_FULL_NAME = `${Cypress.env(
  'GITHUB_OWNER'
)}/${IMPORT_REPO_NAME}`;
export const IMPORT_REPO_URL = `https://github.com/${IMPORT_REPO_FULL_NAME}`;
