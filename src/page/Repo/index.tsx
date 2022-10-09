import { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flex } from '@chakra-ui/react';
import { useAppSelector } from '../../redux/store';

const Repo = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { editingRepo, editingRepoConfig } = useAppSelector(
    (state) => state.EditingRepoReducer
  );

  useEffect(() => {
    if (!editingRepo || !editingRepoConfig) navigate('/dashboard');
  }, [editingRepo, editingRepoConfig]);

  if (!editingRepo || !editingRepoConfig) {
    return null;
  }
  return <Flex>{t('Repo')}</Flex>;
};

export default memo(Repo);
