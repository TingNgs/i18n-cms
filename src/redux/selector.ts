import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

export const isAuthSelector = createSelector(
  (state: RootState) => state.AppReducer.authState,
  (authState) => authState === 'signIn'
);

export const localeKeysSelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.localeKeys,
  (state: RootState, namespace?: string) => namespace,
  (localeKeys, namespace) => {
    if (!localeKeys || !namespace) return [];
    return localeKeys[namespace];
  }
);
