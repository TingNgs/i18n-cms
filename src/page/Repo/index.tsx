import { memo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Flex, HStack } from '@chakra-ui/react';

import { useAppDispatch, useAppSelector } from '../../redux/store';

import BranchFormModal from './BranchFormModal';
import Sidebar from './Namespaces';
import Table from './Table';
import { isDataChangedSelector } from './hooks/useSaveEditing';
import SaveEditingModal from './SaveEditingModal';
import { setSaveModalOpen } from '../../redux/editingRepoSlice';

const Repo = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isDataChanged = useAppSelector(isDataChangedSelector);

  const { editingRepo, branch } = useAppSelector((state) => ({
    editingRepo: state.EditingRepoReducer.editingRepo,
    branch: state.EditingRepoReducer.branch
  }));

  useEffect(() => {
    if (!editingRepo) navigate('/dashboard');
  }, [editingRepo]);

  const openSaveModal = useCallback(() => {
    dispatch(setSaveModalOpen(true));
  }, []);

  if (!editingRepo) {
    return null;
  }

  return (
    <Flex overflow="hidden" flex={1}>
      <Sidebar />
      <Flex flex={1} flexDir="column">
        <HStack>
          <Button disabled={!isDataChanged} onClick={openSaveModal}>
            Save
          </Button>
        </HStack>

        <Table />
      </Flex>
      <SaveEditingModal />

      {!branch && <BranchFormModal repo={editingRepo} />}
    </Flex>
  );
};

export default memo(Repo);
