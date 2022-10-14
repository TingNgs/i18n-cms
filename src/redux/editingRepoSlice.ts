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
    [namespace: string]: { [id: string]: ModifiedLocalesData };
  };
  localeIds: {
    [namespace: string]: string[];
  };

  isSaveModalOpen: boolean;
}

const initialState: EdiotingRepoState = {
  namespaces: [],
  languages: [],
  selectedLanguages: [],
  originalLocalesData: {},
  modifiedLocalesData: {},
  localeIds: {},
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
      state.modifiedLocalesData[namespace] = {};
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

      state.localeIds[namespace] = Array.from(keySet).map((key) => {
        const id = uniqueId(namespace);
        state.modifiedLocalesData[namespace][id] = {
          key,
          value: state.languages.reduce<{ [lng: string]: string }>(
            (acc, cur) => {
              acc[cur] = data[cur][key];
              return acc;
            },
            {}
          )
        };
        return id;
      });
    },
    reorderNamespaceIds: (
      state,
      action: PayloadAction<{
        data: string[];
        namespace: string;
      }>
    ) => {
      const { namespace, data } = action.payload;
      state.localeIds[namespace] = data;
    },
    handleLocaleOnChange: (
      state,
      action: PayloadAction<{
        language: string;
        localeId: string;
        value: string;
      }>
    ) => {
      if (!state.selectedNamespace) return state;
      const { language, localeId, value } = action.payload;
      state.modifiedLocalesData[state.selectedNamespace][localeId]['value'][
        language
      ] = value;
    },
    handleLocaleKeyOnChange: (
      state,
      action: PayloadAction<{ value: string; localeId: string }>
    ) => {
      const { value, localeId } = action.payload;
      if (!state.selectedNamespace) return;
      const namespace = state.selectedNamespace;

      state.modifiedLocalesData[namespace][localeId]['key'] = value;
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
    addLocaleAfterIndex: (state, action: PayloadAction<{ index: number }>) => {
      const namespace = state.selectedNamespace;
      if (!namespace) return state;
      const id = uniqueId(namespace);
      state.localeIds[namespace].splice(action.payload.index + 1, 0, id);
      state.modifiedLocalesData[namespace][id] = { key: id, value: {} };
    },
    removeLocaleOnIndex: (state, action: PayloadAction<{ index: number }>) => {
      const namespace = state.selectedNamespace;
      if (!namespace) return state;
      state.localeIds[namespace].splice(action.payload.index, 1);
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
  reorderNamespaceIds,
  addLocaleAfterIndex,
  removeLocaleOnIndex,
  closeEditingRepo
} = editingRepoSlice.actions;

export default editingRepoSlice.reducer;
