declare module 'parse-bitbucket-url' {
  function parseBitbucketUrl(value: string): { name: string; owner: string };
  export default parseBitbucketUrl;
}
