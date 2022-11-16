import { createSelector } from '@reduxjs/toolkit';
import { groupBy, pickBy, mapValues, includes, isEqual } from 'lodash-es';

import { FLATTEN_FILE_TYPE } from '../constants';
import { RootState } from './store';

export const isAuthSelector = createSelector(
  (state: RootState) => state.AppReducer.authState,
  (authState) => authState === 'signIn'
);

export const duplicatedKeysSelectorFactory = (namespace?: string) => {
  const namespaceKeysSelector = createSelector(
    (state: RootState) => state.EditingRepoReducer.localeIds,
    (state: RootState) => state.EditingRepoReducer.modifiedLocalesData,
    (state: RootState) => state.EditingRepoReducer.selectedNamespace,
    (localeIds, modifiedLocalesData, selectedNamespace) => {
      const ns = namespace || selectedNamespace;

      if (!ns || !localeIds[ns] || !modifiedLocalesData[ns]) return [];
      return localeIds[ns].map((id) => modifiedLocalesData[ns][id].key);
    },
    {
      memoizeOptions: {
        resultEqualityCheck: isEqual
      }
    }
  );

  return createSelector(
    [
      (state: RootState) => state.EditingRepoReducer.editingRepoConfig,
      (state: RootState) => namespaceKeysSelector(state)
    ],
    (editingRepoConfig, keys) => {
      if (!editingRepoConfig) return {};

      const keyCountMap = mapValues(groupBy(keys), (value) => value.length);
      if (!includes(FLATTEN_FILE_TYPE, editingRepoConfig.fileType)) {
        const nestedKeyList = keys.filter((key) => key.split('.').length > 1);
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
};

export const duplicatedKeysSelectorMap: {
  [namespace: string]: ReturnType<typeof duplicatedKeysSelectorFactory>;
} = {};

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
