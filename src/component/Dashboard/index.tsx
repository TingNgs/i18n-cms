import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Stack, Text } from '@chakra-ui/react';
import AddRepoButton from '../AddRepoButton';
import { useGetExistingRepoQuery } from '../../redux/services/firestoreApi';

const Dashboard = () => {
  const { t } = useTranslation();
  const { data } = useGetExistingRepoQuery(undefined);
  console.log(data);
  return (
    <Stack>
      <Text fontSize="2xl">{t('Existing repository')}</Text>

      <Stack>
        {data?.map((repo) => (
          <Flex key={repo.fullName}>
            <Text>{repo.fullName}</Text>
          </Flex>
        ))}
        <AddRepoButton />
      </Stack>
    </Stack>
  );
};

export default memo(Dashboard);
