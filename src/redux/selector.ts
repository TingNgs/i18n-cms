import { createSelector } from '@reduxjs/toolkit';
import { groupBy, pickBy } from 'lodash-es';
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
    if (!namespace) return {};
    const keys = modifiedLocalesData[namespace]?.map(({ key }) => key);
    return pickBy(groupBy(keys), (value) => value.length > 1);
  }
);
