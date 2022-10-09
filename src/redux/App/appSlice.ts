import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { AuthApi } from '../services/authApi';

export interface AppState {
  authState: 'initial' | 'signOff' | 'signIn';
  githubAccessToken?: string;
  firebaseUid?: string;
}

const initialState: AppState = {
  authState: 'initial',
  firebaseUid: undefined
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<AppState['authState']>) => {
      state.authState = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      AuthApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.authState = 'signIn';
        state.firebaseUid = payload.uid;
      }
    );
    builder.addMatcher(AuthApi.endpoints.logout.matchFulfilled, (state) => {
      state.authState = 'signOff';
    });
  }
});

// Action creators are generated for each case reducer function
export const { setAuthState } = appSlice.actions;

export default appSlice.reducer;
