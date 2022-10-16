import { createSelector } from '@reduxjs/toolkit';
import { groupBy, pickBy, mapValues } from 'lodash-es';
import { RootState } from './store';

export const isAuthSelector = createSelector(
  (state: RootState) => state.AppReducer.authState,
  (authState) => authState === 'signIn'
);

export const duplicatedKeySelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.modifiedLocalesData,
  (state: RootState, namespace?: string) =>
    namespace || state.EditingRepoReducer.selectedNamespace,
  (modifiedLocalesData, namespace) => {
    if (!namespace || !modifiedLocalesData[namespace]) return {};
    const keys = Object.entries(modifiedLocalesData[namespace]).map(
      ([, data]) => data.key
    );
    return mapValues(
      pickBy(groupBy(keys), (value) => value.length > 1),
      () => true
    );
  }
);

export const selectedLanguagesSelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.languages,
  (state: RootState) => state.EditingRepoReducer.selectedLanguagesMap,
  (languages, selectedLanguagesMap) =>
    languages.filter((language) => selectedLanguagesMap[language])
);
