import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import firebase, { db } from '../../firebase';

const auth = getAuth(firebase);
const provider = new GithubAuthProvider();

export const AuthApi = createApi({
  reducerPath: 'authApi',
  tagTypes: ['Auth'],
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation<{ accessToken: string; uid: string }, undefined>({
      queryFn: async () => {
        try {
          const result = await signInWithPopup(auth, provider);
          const credential = GithubAuthProvider.credentialFromResult(result);
          if (!credential?.accessToken) throw new Error('no credential');
          const { accessToken } = credential;

          setDoc(doc(db, 'users', result.user.uid), {
            github_access_token: accessToken
          }).catch((err) => {
            console.error(err);
          });

          return { data: { accessToken, uid: result.user.uid } };
        } catch (e) {
          return { error: e };
        }
      },
      invalidatesTags: ['Auth']
    }),
    logout: builder.mutation<Promise<void>, undefined>({
      queryFn: async () => {
        try {
          return { data: signOut(auth) };
        } catch (e) {
          return { error: e };
        }
      },
      invalidatesTags: ['Auth']
    }),
    getGithubAccessToken: builder.mutation<
      { accessToken: string; uid: string },
      { userId: string }
    >({
      queryFn: async ({ userId }) => {
        try {
          const docRef = doc(db, 'users', userId);
          const docSnap = await getDoc(docRef);

          return {
            data: {
              accessToken: docSnap.data()?.github_access_token,
              uid: userId
            }
          };
        } catch (e) {
          return { error: e };
        }
      },
      invalidatesTags: ['Auth']
    })
  })
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetGithubAccessTokenMutation
} = AuthApi;
