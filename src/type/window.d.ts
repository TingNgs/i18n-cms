import { RepoConfig } from '../redux/editingRepoSlice';

declare global {
  interface Window {
    getCustomPath?: (value: {
      namespace: string;
      language: string;
      repoConfig: RepoConfig;
    }) => void;
  }
}
