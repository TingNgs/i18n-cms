import { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Flex, HStack } from '@chakra-ui/react';

import { useAppSelector } from '../../redux/store';

import BranchFormModal from './BranchFormModal';
import Sidebar from './Namespaces';
import Table from './Table';
import useSaveEditing from '../../component/SaveEditingModal/useSaveEditing';

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

  const saveEditing = useSaveEditing();

  return (
    <Flex overflow="hidden" flex={1}>
      <Sidebar />
      <Flex flex={1} flexDir="column">
        <HStack>
          <Button
            onClick={() => saveEditing({ commitMessage: 'Update locales' })}>
            Save
          </Button>
        </HStack>

        <Table />
      </Flex>

      {!branch && <BranchFormModal repo={editingRepo} />}
    </Flex>
  );
};

export default memo(Repo);
