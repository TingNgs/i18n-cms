import { RepoConfig } from '../../../redux/editingRepoSlice';

export interface FormValues {
  action: 'existing' | 'create';
  baseOn: string;
  newBranchName: string;
  existingBranchName: string;
  isRecentBranch: boolean;

  config?: RepoConfig;
}
