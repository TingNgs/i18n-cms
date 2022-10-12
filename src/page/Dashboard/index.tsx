import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton, Stack, Text } from '@chakra-ui/react';
import AddRepoButton from '../../component/AddRepoButton';
import { useGetExistingRepoQuery } from '../../redux/services/firestoreApi';
import RepoCard from './RepoCard';

const Dashboard = () => {
  const { t } = useTranslation();
  const { data } = useGetExistingRepoQuery(undefined);

  return (
    <Stack alignItems="center">
      <Stack width="300px">
        <AddRepoButton />
        <Text fontSize="2xl">{t('Existing repository')}</Text>
        {data ? (
          data.map((repo) => <RepoCard key={repo.fullName} repo={repo} />)
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