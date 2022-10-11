import { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex } from '@chakra-ui/react';

import { useAppSelector } from '../../redux/store';

import BranchFormModal from './BranchFormModal';
import Sidebar from './Namespaces';
import Table from './Table';

const Repo = () => {
  const navigate = useNavigate();

  const { editingRepo, branch } = useAppSelector((state) => ({
    editingRepo: state.EditingRepoReducer.editingRepo,
    branch: state.EditingRepoReducer.branch
  }));

  useEffect(() => {
    if (!editingRepo) navigate('/dashboard');
  }, [editingRepo]);

  if (!editingRepo) {
    return null;
  }

  return (
    <Flex overflow="hidden" flex={1}>
      <Sidebar />
      <Table />
      {!branch && <BranchFormModal repo={editingRepo} />}
    </Flex>
  );
};

export default memo(Repo);
