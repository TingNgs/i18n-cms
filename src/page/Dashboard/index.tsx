import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton, Stack, Text } from '@chakra-ui/react';
import AddRepoButton from './AddRepoButton';
import { useGetExistingRepoQuery } from '../../redux/services/firestoreApi';
import RepoCard from './RepoCard';

const Dashboard = () => {
  const { t } = useTranslation('dashboard');
  const { data, refetch } = useGetExistingRepoQuery(undefined);

  return (
    <Stack alignItems="center" width="100%">
      <Stack width="300px">
        <AddRepoButton />
        <Text fontSize="2xl">{t('Existing repository')}</Text>
        {data ? (
          data.map((repo) => (
            <RepoCard key={repo.fullName} refetch={refetch} repo={repo} />
          ))
        ) : (
          <>
            <Skeleton h="40px" />
            <Skeleton h="40px" />
            <Skeleton h="40px" />
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default memo(Dashboard);
