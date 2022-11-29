import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

import GitApiWrapper from '../../utils/GitApiWrapper';
import GitApi from '../../utils/GitApiWrapper/interface';

export const OctokitApi = createApi({
  reducerPath: 'octokitApi',
  tagTypes: ['octokit'],
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getUser: builder.query<
      Awaited<ReturnType<GitApi['getCurrentUser']>>,
      undefined
    >({
      queryFn: async () => {
        const data = await GitApiWrapper['Github'].getCurrentUser();
        return { data };
      }
    }),
    getOrganization: builder.query<
      Awaited<ReturnType<GitApi['getOrganization']>>,
      undefined
    >({
      queryFn: async () => {
        const data = await GitApiWrapper['Github'].getOrganization();
        return { data };
      }
    }),
    getRepo: builder.query<
      Awaited<ReturnType<GitApi['getRepo']>>,
      Parameters<GitApi['getRepo']>[0]
    >({
      queryFn: async (data) => {
        return { data: await GitApiWrapper['Github'].getRepo(data) };
      },
      keepUnusedDataFor: 0.0001
    }),
    createRepo: builder.mutation<
      Awaited<ReturnType<GitApi['createRepo']>>,
      Parameters<GitApi['createRepo']>[0]
    >({
      queryFn: async (data) => {
        return { data: await GitApiWrapper['Github'].createRepo(data) };
      }
    }),
    getContent: builder.query<
      Awaited<ReturnType<GitApi['getContent']>>,
      Parameters<GitApi['getContent']>[0]
    >({
      queryFn: async (data) => {
        return { data: await GitApiWrapper['Github'].getContent(data) };
      }
    }),
    getTree: builder.query<
      Awaited<ReturnType<GitApi['getTree']>>,
      Parameters<GitApi['getTree']>[0]
    >({
      queryFn: async (data) => {
        return { data: await GitApiWrapper['Github'].getTree(data) };
      }
    }),
    getBranch: builder.query<
      Awaited<ReturnType<GitApi['getBranch']>>,
      Parameters<GitApi['getBranch']>[0]
    >({
      queryFn: async (data) => {
        return { data: await GitApiWrapper['Github'].getBranch(data) };
      }
    }),
    createBranch: builder.mutation<
      Awaited<ReturnType<GitApi['createBranch']>>,
      Parameters<GitApi['createBranch']>[0]
    >({
      queryFn: async (data) => {
        return { data: await GitApiWrapper['Github'].createBranch(data) };
      }
    }),
    commitFiles: builder.mutation<
      Awaited<ReturnType<GitApi['commitFiles']>>,
      Parameters<GitApi['commitFiles']>[0]
    >({
      queryFn: async (data) => {
        return { data: await GitApiWrapper['Github'].commitFiles(data) };
      }
    })
  })
});

export const {
  useCreateRepoMutation,
  useCommitFilesMutation,
  useGetUserQuery,
  useGetOrganizationQuery,
  useLazyGetRepoQuery,
  useLazyGetContentQuery,
  useLazyGetTreeQuery,
  useLazyGetBranchQuery,
  useCreateBranchMutation
} = OctokitApi;
