import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const isAuthSelector = createSelector(
  (state: RootState) => state.AppReducer.authState,
  (authState) => authState === 'signIn'
);
