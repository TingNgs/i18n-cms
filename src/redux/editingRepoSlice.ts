import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { LOCALES_FILE_STRUCTURE, LOCALES_FILE_TYPE } from '../constants';

export interface RepoConfig {
  fileStructure: typeof LOCALES_FILE_STRUCTURE[number];
  fileType: typeof LOCALES_FILE_TYPE[number];
  basePath: string;
}

export interface Repo {
  owner: string;
  repo: string;
}

export interface EdiotingRepoState {
  editingRepo?: Repo;
  editingRepoConfig?: RepoConfig;
}

const initialState: EdiotingRepoState = {};

export const editingRepoSlice = createSlice({
  name: 'editingRepo',
  initialState,
  reducers: {
    setEditingRepo: (state, action: PayloadAction<Repo>) => {
      state.editingRepo = action.payload;
    },
    setEditingRepoConfig: (state, action: PayloadAction<RepoConfig>) => {
      state.editingRepoConfig = action.payload;
    },
    closeEditingRepo: () => initialState
  }
});

// Action creators are generated for each case reducer function
export const { setEditingRepoConfig, setEditingRepo, closeEditingRepo } =
  editingRepoSlice.actions;

export default editingRepoSlice.reducer;
