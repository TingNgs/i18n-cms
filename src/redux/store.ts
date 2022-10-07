import { configureStore, Store } from '@reduxjs/toolkit';
import {
  useDispatch,
  useSelector,
  TypedUseSelectorHook,
  useStore
} from 'react-redux';
import { AuthApi } from './services/authApi';
import { OctokitApi } from './services/octokitApi';

import AppReducer from './App/appSlice';

export const store = configureStore({
  reducer: {
    AppReducer,
    [AuthApi.reducerPath]: AuthApi.reducer,
    [OctokitApi.reducerPath]: OctokitApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([AuthApi.middleware, OctokitApi.middleware])
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppStore: () => Store<RootState> = useStore;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
