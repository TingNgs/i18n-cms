import { Octokit } from 'octokit';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

let octokit = new Octokit({});

const getGithubAccessToken = (state: RootState) =>
  state.AppReducer.githubAccessToken;

export type Repo = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.rest.repos.listForAuthenticatedUser
>[number];

const setupOctokitClient = (getState: () => unknown) => {
  const auth = getGithubAccessToken(getState() as RootState);
  octokit = new Octokit({
    auth
  });
};

export const OctokitApi = createApi({
  reducerPath: 'octokitApi',
  tagTypes: ['octokit'],
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getGithubRepo: builder.query({
      queryFn: async (arg, { getState }) => {
        try {
          setupOctokitClient(getState);
          const data = await octokit.rest.repos.listForAuthenticatedUser();
          return { data: data?.data };
        } catch (e) {
          return { error: e };
        }
      }
    })
  })
});

export const { useGetGithubRepoQuery } = OctokitApi;
