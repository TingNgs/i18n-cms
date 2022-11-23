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
import { removeSessionStorage, setSessionStorage } from '../../utils/storage';

const firebaseAuth = {
  signInWithPopup,
  GithubAuthProvider
};

if (window.Cypress) {
  window.firebaseAuth = firebaseAuth;
}

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
        await setPersistence(auth, browserSessionPersistence);
        const result = await firebaseAuth.signInWithPopup(auth, provider);
        const credential =
          firebaseAuth.GithubAuthProvider.credentialFromResult(result);
        if (!credential?.accessToken) throw new Error('no credential');
        const { accessToken } = credential;
        setSessionStorage('github_access_token', accessToken);

        return { data: { uid: result.user.uid } };
      },
      invalidatesTags: ['Auth']
    }),
    logout: builder.mutation<Promise<void>, undefined>({
      queryFn: async () => {
        removeSessionStorage('github_access_token');
        return { data: signOut(auth) };
      },
      invalidatesTags: ['Auth']
    })
  })
});

export const { useLoginMutation, useLogoutMutation } = AuthApi;
