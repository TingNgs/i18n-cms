import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex } from '@chakra-ui/react';
import AddRepoButton from '../AddRepoButton';

const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <Flex>
      {t('Existing repository')}

      <Flex>
        <AddRepoButton />
      </Flex>
    </Flex>
  );
};

export default memo(Dashboard);
