import { uniqueId } from 'lodash-es';
import { createSlice, current } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { LOCALES_FILE_TYPE } from '../constants';
import EventBus from '../utils/eventBus';

export interface RepoConfig {
  fileType: typeof LOCALES_FILE_TYPE[number];
  pattern: string;
  defaultLanguage: string;
  languages: string[];
  useCustomPath?: boolean;
  namespaces?: string[];
}

export interface Repo {
  owner: string;
  repo: string;
  fullName: string;
  recentBranches?: string[];
  updated_at?: string;
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
  selectedLanguagesMap: { [key: string]: boolean };

  originalNamespaces: string[];
  originalLanguages: string[];
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
  searchText: string;
  filteredIds: string[];
}

const initialState: EdiotingRepoState = {
  originalNamespaces: [],
  originalLanguages: [],
  originalLocalesData: {},
  namespaces: [],
  languages: [],
  selectedLanguagesMap: {},
  modifiedLocalesData: {},
  localeIds: {},
  isSaveModalOpen: false,
  searchText: '',
  filteredIds: []
};

export const editingRepoSlice = createSlice({
  name: 'editingRepo',
  initialState,
  reducers: {
    setEditingRepo: (state, action: PayloadAction<Repo>) => {
      state.editingRepo = action.payload;
    },
    setInitialRepoData: (
      state,
      action: PayloadAction<{
        namespaces: string[];
        languages: string[];
        repoConfig: RepoConfig;
        branch: string;
      }>
    ) => {
      const { namespaces, languages, repoConfig, branch } = action.payload;
      state.editingRepoConfig = repoConfig;
      state.branch = branch;
      state.languages = languages;
      state.originalLanguages = languages;
      state.namespaces = namespaces;
      state.originalNamespaces = namespaces;
      languages.forEach((language) => {
        state.selectedLanguagesMap[language] = true;
      });
    },
    setSelectedNamespaces: (state, action: PayloadAction<string>) => {
      state.selectedNamespace = action.payload;
      state.searchText = '';
      state.filteredIds = [];
    },
    setLanguages: (state, action: PayloadAction<string[]>) => {
      state.languages = action.payload;
    },
    setLanguageSelected: (
      state,
      action: PayloadAction<{ language: string; value: boolean }>
    ) => {
      const { language, value } = action.payload;
      state.selectedLanguagesMap[language] = value;
    },
    setAllLanguageSelected: (
      state,
      action: PayloadAction<{ value: boolean }>
    ) => {
      const { value } = action.payload;
      state.languages.forEach((language) => {
        state.selectedLanguagesMap[language] = value;
      });
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
      const defaultLanguage = state.editingRepoConfig?.defaultLanguage;

      let keySet = new Set<string>(
        defaultLanguage ? Object.keys(data[defaultLanguage] || {}) : []
      );
      state.originalLanguages.forEach((language) => {
        keySet = new Set([
          ...Array.from(keySet),
          ...Object.keys(data[language] || {})
        ]);
      });

      state.localeIds[namespace] = Array.from(keySet).map((key) => {
        const id = uniqueId(`${namespace}__key__`);
        state.modifiedLocalesData[namespace][id] = {
          key,
          value: state.originalLanguages.reduce<{ [lng: string]: string }>(
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
    setLocaleDataById: (
      state,
      action: PayloadAction<{
        localeId: string;
        data: ModifiedLocalesData;
        namespace: string;
      }>
    ) => {
      const { localeId, data, namespace } = action.payload;
      state.modifiedLocalesData[namespace][localeId] = data;
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
      Object.keys(state.originalLocalesData).forEach((namespace) => {
        if (!state.namespaces.includes(namespace))
          delete state.originalLocalesData[namespace];
      });
      state.originalLanguages = state.languages;
      state.originalNamespaces = state.namespaces;
      for (const namespace in data) {
        if (!state.originalLocalesData[namespace]) {
          state.originalLocalesData[namespace] = {};
        }
        for (const language in data[namespace]) {
          state.originalLocalesData[namespace][language] = {
            ...data[namespace][language]
          };
        }
      }
    },
    addLocaleAfterIndex: (state, action: PayloadAction<{ index?: number }>) => {
      const namespace = state.selectedNamespace;
      if (!namespace || !state.localeIds[namespace]) return state;
      const { index } = action.payload;
      const id = uniqueId(`${namespace}__key__`);
      const newLocaleIndex =
        index === undefined ? state.localeIds[namespace].length : index + 1;
      state.localeIds[namespace].splice(newLocaleIndex, 0, id);
      state.modifiedLocalesData[namespace][id] = { key: id, value: {} };
      EventBus.dispatch('table_scroll_to_index', { index: newLocaleIndex });
    },
    removeLocaleOnIndex: (state, action: PayloadAction<{ index: number }>) => {
      const namespace = state.selectedNamespace;
      if (!namespace) return state;
      const { index } = action.payload;
      const localeId = state.localeIds[namespace][index];
      delete state.modifiedLocalesData[namespace][localeId];
      state.localeIds[namespace].splice(index, 1);
    },
    addNewNamespace: (state, action: PayloadAction<string>) => {
      const namespace = action.payload;
      state.namespaces.push(namespace);
      const firstLocaleId = uniqueId(`${namespace}__key__`);

      state.localeIds[namespace] = [firstLocaleId];
      state.modifiedLocalesData[namespace] = {
        [firstLocaleId]: { key: firstLocaleId, value: {} }
      };
      state.selectedNamespace = namespace;
      state.searchText = '';
      state.filteredIds = [];
    },
    removeNamespace: (state, action: PayloadAction<string>) => {
      const removeNamespace = action.payload;
      state.namespaces = state.namespaces.filter(
        (namespace) => namespace !== removeNamespace
      );

      delete state.localeIds[removeNamespace];
      delete state.modifiedLocalesData[removeNamespace];
      if (state.selectedNamespace === removeNamespace) {
        state.selectedNamespace = undefined;
        state.searchText = '';
        state.filteredIds = [];
      }
    },
    removeLanguage: (state, action: PayloadAction<string>) => {
      const removeLanguage = action.payload;
      state.languages = state.languages.filter(
        (language) => language !== removeLanguage
      );

      delete state.selectedLanguagesMap[removeLanguage];
    },
    addNewLanguage: (state, action: PayloadAction<string>) => {
      const language = action.payload;
      state.languages.push(language);
      state.selectedLanguagesMap[language] = true;
    },
    setSaveModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSaveModalOpen = action.payload;
    },
    setSearchText: (state, action: PayloadAction<{ text: string }>) => {
      if (!state.selectedNamespace) return;
      const selectedNamespace = state.selectedNamespace;
      const { text } = action.payload;
      state.searchText = text;
      state.filteredIds = state.localeIds[selectedNamespace].filter((id) => {
        const locale = current(
          state.modifiedLocalesData[selectedNamespace][id]
        );
        return (
          locale.key.includes(text) ||
          state.languages.some((language) =>
            locale.value[language]?.includes(text)
          )
        );
      });
    },
    closeEditingRepo: () => initialState
  }
});

// Action creators are generated for each case reducer function
export const {
  setInitialRepoData,
  setEditingRepo,
  setSelectedNamespaces,
  setLanguages,
  setLanguageSelected,
  setAllLanguageSelected,
  setLocalesDataByNamespace,
  setLocaleDataById,
  handleLocaleOnChange,
  handleLocaleKeyOnChange,
  saveLocaleSuccess,
  setSaveModalOpen,
  reorderNamespaceIds,
  addLocaleAfterIndex,
  removeLocaleOnIndex,
  addNewNamespace,
  addNewLanguage,
  removeNamespace,
  removeLanguage,
  closeEditingRepo,
  setSearchText
} = editingRepoSlice.actions;

export default editingRepoSlice.reducer;
