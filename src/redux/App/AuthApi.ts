import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

import { getAuth, signInWithPopup, GithubAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import firebase, { db } from '../../firebase';

const auth = getAuth(firebase);
const provider = new GithubAuthProvider();
provider.addScope('repo');

export const AuthApi = createApi({
  reducerPath: 'authApi',
  tagTypes: ['Auth'],
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation<{ accessToken: string }, undefined>({
      queryFn: async () => {
        try {
          const result = await signInWithPopup(auth, provider);
          const credential = GithubAuthProvider.credentialFromResult(result);
          if (!credential?.accessToken) throw new Error('no credential');
          const { accessToken } = credential;

          setDoc(doc(db, 'users', result.user.uid), {
            github_access_token: accessToken,
          }).catch((err) => {
            console.error(err);
          });

          return { data: { accessToken } };
        } catch (e) {
          return { error: e };
        }
      },
      invalidatesTags: ['Auth'],
    }),
    getGithubAccessToken: builder.mutation<
      { accessToken: string },
      { userId: string }
    >({
      queryFn: async ({ userId }) => {
        try {
          const docRef = doc(db, 'users', userId);
          const docSnap = await getDoc(docRef);

          return { data: { accessToken: docSnap.data()?.github_access_token } };
        } catch (e) {
          return { error: e };
        }
      },
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useGetGithubAccessTokenMutation } = AuthApi;
