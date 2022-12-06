import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
  signOut,
  browserSessionPersistence,
  signInWithCustomToken,
  setPersistence
} from 'firebase/auth';
import firebase from '../../utils/firebase';
import { removeSessionStorage, setSessionStorage } from '../../utils/storage';

const firebaseAuth = {
  signInWithPopup,
  GithubAuthProvider,
  signInWithCustomToken
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
    loginWithGithub: builder.mutation<{ uid: string }, undefined>({
      queryFn: async () => {
        await setPersistence(auth, browserSessionPersistence);
        const result = await firebaseAuth.signInWithPopup(auth, provider);
        const credential =
          firebaseAuth.GithubAuthProvider.credentialFromResult(result);
        if (!credential?.accessToken) throw new Error('no credential');
        const { accessToken } = credential;
        setSessionStorage('access_token', accessToken);
        setSessionStorage('git_provider', 'github');

        return { data: { uid: result.user.uid } };
      },
      invalidatesTags: ['Auth']
    }),
    loginWithBitbucket: builder.mutation<
      { uid: string },
      {
        token: string;
        access_token: string;
        refresh_token: string;
        expires_in: string;
      }
    >({
      queryFn: async ({ token, access_token, refresh_token, expires_in }) => {
        await setPersistence(auth, browserSessionPersistence);
        const result = await firebaseAuth.signInWithCustomToken(auth, token);
        setSessionStorage('access_token', access_token);
        setSessionStorage(
          'expire_in',
          (Date.now() + 1000 * parseInt(expires_in)).toString()
        );
        setSessionStorage('refresh_token', refresh_token);
        setSessionStorage('git_provider', 'bitbucket');

        return { data: { uid: result.user.uid } };
      },
      invalidatesTags: ['Auth']
    }),
    logout: builder.mutation<Promise<void>, undefined>({
      queryFn: async () => {
        removeSessionStorage('access_token');
        removeSessionStorage('git_provider');
        removeSessionStorage('expire_in');
        removeSessionStorage('refresh_token');
        return { data: signOut(auth) };
      },
      invalidatesTags: ['Auth']
    })
  })
});

export const {
  useLoginWithGithubMutation,
  useLoginWithBitbucketMutation,
  useLogoutMutation
} = AuthApi;
