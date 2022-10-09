import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
  signOut,
  browserSessionPersistence,
  setPersistence
} from 'firebase/auth';
import firebase from '../../utils/firebase';
import {
  removeSessionStorage,
  setSessionStorage
} from '../../utils/sessionStorage';

const auth = getAuth(firebase);
const provider = new GithubAuthProvider();
provider.addScope('repo');
provider.addScope('read:user');

export const AuthApi = createApi({
  reducerPath: 'authApi',
  tagTypes: ['Auth'],
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation<{ uid: string }, undefined>({
      queryFn: async () => {
        try {
          await setPersistence(auth, browserSessionPersistence);
          const result = await signInWithPopup(auth, provider);
          const credential = GithubAuthProvider.credentialFromResult(result);
          if (!credential?.accessToken) throw new Error('no credential');
          const { accessToken } = credential;
          setSessionStorage('github_access_token', accessToken);

          return { data: { uid: result.user.uid } };
        } catch (e) {
          return { error: e };
        }
      },
      invalidatesTags: ['Auth']
    }),
    logout: builder.mutation<Promise<void>, undefined>({
      queryFn: async () => {
        try {
          removeSessionStorage('github_access_token');
          return { data: signOut(auth) };
        } catch (e) {
          return { error: e };
        }
      },
      invalidatesTags: ['Auth']
    })
  })
});

export const { useLoginMutation, useLogoutMutation } = AuthApi;
