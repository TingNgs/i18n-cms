import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

import {
  getFirestore,
  setDoc,
  doc,
  collection,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import firebase from '../../utils/firebase';
import { Repo } from '../editingRepoSlice';

import { RootState } from '../store';

const db = getFirestore(firebase);

export const FirestoreApi = createApi({
  reducerPath: 'firestoreApi',
  tagTypes: ['firestore'],
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getExistingRepo: builder.query<Repo[], undefined>({
      queryFn: async (arg, { getState }) => {
        const uid = (getState() as RootState).AppReducer.firebaseUid;
        if (!uid) throw new Error('no uid');
        const q = await getDocs(collection(db, 'users', uid, 'repos'));
        const data: Repo[] = [];
        q.forEach((e) => data.push(e.data() as Repo));
        return { data };
      }
    }),
    updateExistingRepo: builder.mutation<Repo, Repo>({
      queryFn: async (
        { repo, owner, fullName, recentBranches },
        { getState }
      ) => {
        const uid = (getState() as RootState).AppReducer.firebaseUid;
        if (!uid) throw new Error('no uid');
        await setDoc(doc(db, 'users', uid, 'repos', `${owner}-${repo}`), {
          repo,
          owner,
          fullName,
          recentBranches
        });

        return {
          data: {
            repo,
            owner,
            fullName,
            recentBranches
          }
        };
      },
      invalidatesTags: ['firestore']
    }),
    removeExistingRepo: builder.mutation<undefined, Repo>({
      queryFn: async ({ repo, owner }, { getState }) => {
        const uid = (getState() as RootState).AppReducer.firebaseUid;
        if (!uid) throw new Error('no uid');
        await deleteDoc(doc(db, 'users', uid, 'repos', `${owner}-${repo}`));
        return { data: undefined };
      },
      invalidatesTags: ['firestore']
    })
  })
});

export const {
  useUpdateExistingRepoMutation,
  useGetExistingRepoQuery,
  useRemoveExistingRepoMutation
} = FirestoreApi;
