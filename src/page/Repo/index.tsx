import { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flex } from '@chakra-ui/react';

import { useAppSelector } from '../../redux/store';

import BranchFormModal from './BranchFormModal';

const Repo = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { editingRepo, branch } = useAppSelector(
    (state) => state.EditingRepoReducer
  );

  useEffect(() => {
    if (!editingRepo) navigate('/dashboard');
  }, [editingRepo]);

  if (!editingRepo) {
    return null;
  }

  return (
    <Flex>
      {t('Repo')}

      {!branch && <BranchFormModal repo={editingRepo} />}
    </Flex>
  );
};

export default memo(Repo);
