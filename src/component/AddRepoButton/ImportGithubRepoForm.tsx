import { Button, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const CreateNewRepoForm = () => {
  const { t } = useTranslation();

  return (
    <>
      <Text fontSize="2xl">{t('Import existing i18n repository')}</Text>

      <Button>{t('Create')}</Button>
    </>
  );
};

export default CreateNewRepoForm;
