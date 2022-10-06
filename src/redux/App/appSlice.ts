import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { AuthApi } from './AuthApi';

export interface AppState {
  authState: 'initial' | 'signOff' | 'signIn';
  githubAccessToken?: string;
}

const initialState: AppState = {
  authState: 'initial',
  githubAccessToken: undefined
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setIsLogin: (state, action: PayloadAction<AppState['authState']>) => {
      state.authState = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      AuthApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.authState = 'signIn';
        state.githubAccessToken = payload.accessToken;
      }
    );
    builder.addMatcher(
      AuthApi.endpoints.getGithubAccessToken.matchFulfilled,
      (state, { payload }) => {
        state.authState = 'signIn';
        state.githubAccessToken = payload.accessToken;
      }
    );
  }
});

// Action creators are generated for each case reducer function
export const { setIsLogin } = appSlice.actions;

export default appSlice.reducer;
