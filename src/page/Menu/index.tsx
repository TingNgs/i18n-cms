import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Text } from '@chakra-ui/react';
import AddRepoButton from './AddRepoButton';

import RepoList from './RepoList';

const Menu = () => {
  const { t } = useTranslation('menu');

  return (
    <Stack alignItems="center" width="100%">
      <Stack width="300px" maxW={'100%'}>
        <AddRepoButton />
        <Text fontSize="2xl">{t('Existing repository')}</Text>
        <RepoList />
      </Stack>
    </Stack>
  );
};

export default memo(Menu);
