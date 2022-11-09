import { Octokit } from '@octokit/rest';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { REPOSITORY_VISIBILITY } from '../../constants';
import { getSessionStorage } from '../../utils/storage';
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
      },
      keepUnusedDataFor: 0.0001
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
      { repo: string; owner: string; path: string; ref?: string }
    >({
      queryFn: async ({ repo, owner, path, ref }) => {
        setupOctokitClient();
        const result = await octokit.rest.repos.getContent({
          repo,
          owner,
          path,
          ref
        });
        return { data: result?.data };
      }
    }),
    getGithubTree: builder.query<
      GetResponseDataTypeFromEndpointMethod<typeof octokit.rest.git.getTree>,
      { repo: string; owner: string; treeSha: string }
    >({
      queryFn: async ({ repo, owner, treeSha }) => {
        setupOctokitClient();
        const result = await octokit.rest.git.getTree({
          repo,
          owner,
          tree_sha: treeSha,
          recursive: '1'
        });
        return { data: result?.data };
      }
    }),
    getGithubBranch: builder.query<
      GetResponseDataTypeFromEndpointMethod<
        typeof octokit.rest.repos.getBranch
      >,
      { repo: string; owner: string; branch: string }
    >({
      queryFn: async ({ repo, owner, branch }) => {
        setupOctokitClient();
        const result = await octokit.rest.repos.getBranch({
          repo,
          owner,
          branch
        });
        return { data: result?.data };
      }
    }),
    createGithubRef: builder.mutation<
      GetResponseDataTypeFromEndpointMethod<typeof octokit.rest.git.createRef>,
      { repo: string; owner: string; ref: string; sha: string }
    >({
      queryFn: async ({ repo, owner, ref, sha }) => {
        setupOctokitClient();
        const result = await octokit.rest.git.createRef({
          repo,
          owner,
          ref,
          sha
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
  useLazyGetGithubContentQuery,
  useLazyGetGithubTreeQuery,
  useLazyGetGithubBranchQuery,
  useCreateGithubRefMutation
} = OctokitApi;
