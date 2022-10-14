import { uniqueId } from 'lodash-es';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { LOCALES_FILE_STRUCTURE, LOCALES_FILE_TYPE } from '../constants';

export interface RepoConfig {
  fileStructure: typeof LOCALES_FILE_STRUCTURE[number];
  fileType: typeof LOCALES_FILE_TYPE[number];
  basePath: string;
  defaultNs: string;
}

export interface Repo {
  owner: string;
  repo: string;
  fullName: string;
  recentBranches?: string[];
}

export interface ModifiedLocalesData {
  id: string;
  key: string;
  value: { [lng: string]: string };
}

export interface EdiotingRepoState {
  editingRepo?: Repo;
  editingRepoConfig?: RepoConfig;
  branch?: string;
  namespaces: string[];
  languages: string[];

  selectedNamespace?: string;
  selectedLanguages: string[];

  originalLocalesData: {
    [namespace: string]: { [lng: string]: { [key: string]: string } };
  };

  modifiedLocalesData: {
    [namespace: string]: ModifiedLocalesData[];
  };

  isSaveModalOpen: boolean;
}

const initialState: EdiotingRepoState = {
  namespaces: [],
  languages: [],
  selectedLanguages: [],
  originalLocalesData: {},
  modifiedLocalesData: {},
  isSaveModalOpen: false
};

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
    setBranch: (state, action: PayloadAction<string>) => {
      state.branch = action.payload;
    },
    setSelectedNamespaces: (state, action: PayloadAction<string>) => {
      state.selectedNamespace = action.payload;
    },
    setLanguages: (state, action: PayloadAction<string[]>) => {
      state.languages = action.payload;
    },
    setNamespaces: (state, action: PayloadAction<string[]>) => {
      state.namespaces = action.payload;
    },
    setSelectedLanguages: (state, action: PayloadAction<string[]>) => {
      state.selectedLanguages = action.payload;
    },
    setLocalesDataByNamespace: (
      state,
      action: PayloadAction<{
        namespace: string;
        data: { [language: string]: { [key: string]: string } };
      }>
    ) => {
      const { namespace, data } = action.payload;
      state.originalLocalesData[namespace] = data;
      const defaultNs = state.editingRepoConfig?.defaultNs;

      let keySet = new Set<string>(
        defaultNs ? Object.keys(data[defaultNs]) : []
      );
      state.languages.forEach((language) => {
        keySet = new Set([
          ...Array.from(keySet),
          ...Object.keys(data[language])
        ]);
      });

      state.modifiedLocalesData[namespace] = Array.from(keySet).map((key) => ({
        id: uniqueId(namespace),
        key,
        value: state.languages.reduce<{ [lng: string]: string }>((acc, cur) => {
          acc[cur] = data[cur][key];
          return acc;
        }, {})
      }));
    },
    setNamespaceLocales: (
      state,
      action: PayloadAction<{
        data: ModifiedLocalesData[];
        namespace: string;
      }>
    ) => {
      const { namespace, data } = action.payload;
      state.modifiedLocalesData[namespace] = data;
    },
    handleLocaleOnChange: (
      state,
      action: PayloadAction<{
        language: string;
        index: number;
        value: string;
      }>
    ) => {
      const { language, index, value } = action.payload;
      if (state.selectedNamespace)
        state.modifiedLocalesData[state.selectedNamespace][index]['value'][
          language
        ] = value;
    },
    handleLocaleKeyOnChange: (
      state,
      action: PayloadAction<{ value: string; index: number }>
    ) => {
      const { value, index } = action.payload;
      if (!state.selectedNamespace) return;
      const namespace = state.selectedNamespace;

      state.modifiedLocalesData[namespace][index]['key'] = value;
    },
    saveLocaleSuccess: (
      state,
      action: PayloadAction<{
        [namespace: string]: { [lng: string]: { [key: string]: string } };
      }>
    ) => {
      const data = action.payload;
      state.isSaveModalOpen = false;
      for (const namespace in data) {
        for (const language in data[namespace]) {
          state.originalLocalesData[namespace][language] = {
            ...data[namespace][language]
          };
        }
      }
    },
    setSaveModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSaveModalOpen = action.payload;
    },
    closeEditingRepo: () => initialState
  }
});

// Action creators are generated for each case reducer function
export const {
  setEditingRepoConfig,
  setEditingRepo,
  setBranch,
  setSelectedNamespaces,
  setLanguages,
  setNamespaces,
  setSelectedLanguages,
  setLocalesDataByNamespace,
  handleLocaleOnChange,
  handleLocaleKeyOnChange,
  saveLocaleSuccess,
  setSaveModalOpen,
  setNamespaceLocales,
  closeEditingRepo
} = editingRepoSlice.actions;

export default editingRepoSlice.reducer;
