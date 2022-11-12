import { memo } from 'react';
import { Flex, Text } from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

const FilterTags = () => {
  const { t } = useTranslation('repo');

  return (
    <Flex p="2" gap="2">
      <Text>{t('Filter')}:</Text>
    </Flex>
  );
};

export default memo(FilterTags);
