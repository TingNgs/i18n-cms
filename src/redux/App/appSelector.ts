import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const isAuthSelector = createSelector(
  (state: RootState) => state.AppReducer.authState,
  (state: RootState) => state.AppReducer.githubAccessToken,
  (authState, githubAccessToken) =>
    authState === 'signIn' && !!githubAccessToken
);
