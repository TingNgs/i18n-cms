import { Button, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Repo } from '../../redux/services/octokitApi';
import GithubRepoSelect from '../GithubRepoSelect';

const CreateNewRepoForm = () => {
  const { t } = useTranslation();
  const [repo, setRepo] = useState<undefined | Repo>(undefined);
  return (
    <>
      <Text fontSize="2xl">{t('Import existing i18n repository')}</Text>
      <GithubRepoSelect setSelectedRepo={setRepo} />
      <Button disabled={!repo}>{t('Create')}</Button>
    </>
  );
};

export default CreateNewRepoForm;
