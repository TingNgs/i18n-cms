import { memo } from 'react';
import { Skeleton } from '@chakra-ui/react';

import { useGetExistingRepoQuery } from '../../redux/services/firestoreApi';
import RepoCard from './RepoCard';

const RepoList = () => {
  const { data, isFetching, refetch } = useGetExistingRepoQuery(undefined, {
    refetchOnMountOrArgChange: true
  });

  if (isFetching)
    return (
      <>
        <Skeleton h="40px" />
        <Skeleton h="40px" />
        <Skeleton h="40px" />
      </>
    );

  return (
    <>
      {data?.map((repo) => (
        <RepoCard key={repo.fullName} refetch={refetch} repo={repo} />
      ))}
    </>
  );
};

export default memo(RepoList);
