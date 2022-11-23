/* eslint-disable @typescript-eslint/no-explicit-any */
import { RepoConfig } from '../redux/editingRepoSlice';

declare global {
  interface Window {
    getCustomPath?: (value: {
      namespace: string;
      language: string;
      repoConfig: RepoConfig;
    }) => Promise<string>;
    firebaseAuth?: any;
    Cypress?: any;
  }
}
