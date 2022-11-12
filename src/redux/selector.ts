import { createSelector } from '@reduxjs/toolkit';
import { groupBy, pickBy, mapValues, includes, map } from 'lodash-es';
import { FLATTEN_LOCALES_FILE_TYPE } from '../constants';
import { RootState } from './store';

export const isAuthSelector = createSelector(
  (state: RootState) => state.AppReducer.authState,
  (authState) => authState === 'signIn'
);

export const duplicatedKeySelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.editingRepoConfig,
  (state: RootState, namespace?: string) =>
    state.EditingRepoReducer.localeIds[
      namespace || state.EditingRepoReducer.selectedNamespace || ''
    ],
  (state: RootState, namespace?: string) =>
    state.EditingRepoReducer.modifiedLocalesData[
      namespace || state.EditingRepoReducer.selectedNamespace || ''
    ],
  (editingRepoConfig, localeIds, localesData) => {
    if (!localeIds || !localesData || !editingRepoConfig) return {};
    const nestedKeyList: string[] = [];
    const keys = map(localeIds, (localeId) => {
      const data = localesData[localeId];
      const { key } = data;
      if (key.split('.').length > 1) {
        nestedKeyList.push(data.key);
      }
      return data.key;
    });

    const keyCountMap = mapValues(groupBy(keys), (value) => value.length);
    if (!includes(FLATTEN_LOCALES_FILE_TYPE, editingRepoConfig.fileType)) {
      nestedKeyList.forEach((nestedKey) => {
        const keyArray = nestedKey.split('.');
        keyArray.forEach((n, index) => {
          const key = keyArray.slice(0, index + 1).join('.');
          if (index === keyArray.length - 1) return;
          if (keyCountMap[key]) {
            keyCountMap[key]++;
            keyCountMap[nestedKey]++;
          }
        });
      });
    }

    return pickBy(keyCountMap, (value) => value > 1);
  }
);

export const selectedLanguagesSelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.languages,
  (state: RootState) => state.EditingRepoReducer.selectedLanguagesMap,
  (languages, selectedLanguagesMap) =>
    languages.filter((language) => selectedLanguagesMap[language])
);

export const isSearchResultSelector = () => false;

export const currentLocaleIdsSelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.selectedNamespace,
  (state: RootState) => state.EditingRepoReducer.localeIds,
  () => isSearchResultSelector(),
  (state: RootState) => state.EditingRepoReducer.filteredIds,
  (selectedNamespace, localeIds, isSearchResult, filteredIds) =>
    isSearchResult ? filteredIds : localeIds[selectedNamespace || ''] || []
);

export const translateProgressSelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.localeIds,
  (state: RootState) => state.EditingRepoReducer.modifiedLocalesData,
  (state: RootState) => state.EditingRepoReducer.languages,
  (state: RootState, namespace: string) => namespace,
  (localeIds, modifiedLocalesData, languages, namespace) => {
    if (!localeIds[namespace]) return undefined;
    const totalTranslateCount = localeIds[namespace].length * languages.length;
    const validTranslateCount = localeIds[namespace].reduce((acc, cur) => {
      languages.forEach((language) => {
        if (modifiedLocalesData[namespace][cur].value[language]) acc++;
      });

      return acc;
    }, 0);
    return Math.floor((validTranslateCount / totalTranslateCount) * 100);
  }
);
