import { Octokit } from 'octokit';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { REPOSITORY_VISIBILITY } from '../../constants';
import { getSessionStorage } from '../../utils/sessionStorage';
import commitMultipleFiles, {
  Options as CommentMultipleFilesOptions
} from '../../utils/commitMultipleFiles';
import { Owner } from '../../component/OwnerSelect';

const auth = getSessionStorage('github_access_token');
let octokit = new Octokit({ auth });
let withAuth = !!auth;

export type RepoListForAuthenticatedUser =
  GetResponseDataTypeFromEndpointMethod<
    typeof octokit.rest.repos.listForAuthenticatedUser
  >[number];

const setupOctokitClient = () => {
  if (!withAuth) {
    withAuth = true;
    const auth = getSessionStorage('github_access_token');
    octokit = new Octokit({
      auth
    });
  }
};

export const OctokitApi = createApi({
  reducerPath: 'octokitApi',
  tagTypes: ['octokit'],
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getUser: builder.query<
      GetResponseDataTypeFromEndpointMethod<
        typeof octokit.rest.users.getAuthenticated
      >,
      undefined
    >({
      queryFn: async () => {
        setupOctokitClient();
        const result = await octokit.rest.users.getAuthenticated();
        return { data: result?.data };
      }
    }),
    getOrganization: builder.query<
      GetResponseDataTypeFromEndpointMethod<
        typeof octokit.rest.orgs.listForAuthenticatedUser
      >,
      undefined
    >({
      queryFn: async () => {
        setupOctokitClient();
        const result = await octokit.rest.orgs.listForAuthenticatedUser();
        return { data: result?.data };
      }
    }),
    getGithubRepo: builder.query<
      GetResponseDataTypeFromEndpointMethod<typeof octokit.rest.repos.get>,
      { repo: string; owner: string }
    >({
      queryFn: async ({ repo, owner }) => {
        setupOctokitClient();
        const result = await octokit.rest.repos.get({ repo, owner });
        return { data: result?.data };
      }
    }),
    commitGithubFiles: builder.mutation<
      Awaited<ReturnType<typeof commitMultipleFiles>>,
      CommentMultipleFilesOptions
    >({
      queryFn: async (option) => {
        setupOctokitClient();
        const data = await commitMultipleFiles(octokit, option);
        return { data };
      }
    }),
    createGithubRepo: builder.mutation<
      GetResponseDataTypeFromEndpointMethod<
        typeof octokit.rest.repos.createForAuthenticatedUser
      >,
      {
        name: string;
        visibility: typeof REPOSITORY_VISIBILITY[number];
        owner: Owner;
      }
    >({
      queryFn: async ({ name, visibility, owner }) => {
        setupOctokitClient();

        const result = await (owner.type === 'user'
          ? octokit.rest.repos.createForAuthenticatedUser({
              name,
              private: visibility === 'private',
              auto_init: true
            })
          : octokit.rest.repos.createInOrg({
              name,
              org: owner.name,
              private: visibility === 'private',
              auto_init: true
            }));
        return { data: result?.data };
      }
    }),
    getGithubRepoList: builder.query({
      queryFn: async () => {
        setupOctokitClient();
        const result = await octokit.rest.repos.listForAuthenticatedUser();
        return { data: result?.data };
      }
    }),
    getGithubContent: builder.query<
      GetResponseDataTypeFromEndpointMethod<
        typeof octokit.rest.repos.getContent
      >,
      { repo: string; owner: string; path: string }
    >({
      queryFn: async ({ repo, owner, path }) => {
        setupOctokitClient();
        const result = await octokit.rest.repos.getContent({
          repo,
          owner,
          path
        });
        return { data: result?.data };
      }
    })
  })
});

export const {
  useGetGithubRepoListQuery,
  useCreateGithubRepoMutation,
  useCommitGithubFilesMutation,
  useGetUserQuery,
  useGetOrganizationQuery,
  useLazyGetGithubRepoQuery,
  useLazyGetGithubContentQuery
} = OctokitApi;
