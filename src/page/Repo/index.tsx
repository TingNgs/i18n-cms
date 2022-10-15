import { memo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Flex, useBoolean, IconButton } from '@chakra-ui/react';
import { ArrowLeftIcon, HamburgerIcon } from '@chakra-ui/icons';

import { useAppDispatch, useAppSelector } from '../../redux/store';

import BranchFormModal from './BranchFormModal';
import Sidebar from './Sidebar';
import Table from './Table';
import { isDataChangedSelector } from './hooks/useSaveEditing';
import SaveEditingModal from './SaveEditingModal';
import {
  closeEditingRepo,
  setSaveModalOpen
} from '../../redux/editingRepoSlice';

import { SIDEBAR_WIDTH } from './constants';

const Repo = () => {
  const [isSidebarOpen, setSidebarOpen] = useBoolean(true);
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

  useEffect(() => {
    return () => {
      dispatch(closeEditingRepo());
    };
  }, []);

  const openSaveModal = useCallback(() => {
    dispatch(setSaveModalOpen(true));
  }, []);

  if (!editingRepo) {
    return null;
  }

  return (
    <Flex
      overflow="hidden"
      flex={1}
      transition="all 0.3s"
      paddingLeft={isSidebarOpen ? `${SIDEBAR_WIDTH}px` : 0}>
      <Flex
        boxShadow="1px 1px 1px rgb(0,0,0,0.2)"
        position="absolute"
        h="100%"
        flexDir="column"
        transition="left 0.3s"
        left={isSidebarOpen ? '0' : `-${SIDEBAR_WIDTH}px`}
        zIndex="1">
        <Sidebar onClose={setSidebarOpen.off} />
      </Flex>
      <Flex flexDir="column" flex={1}>
        <Flex w="100%" justifyContent="space-between">
          <IconButton
            w={'56px'}
            h={'56px'}
            position="relative"
            right="1px"
            boxShadow="1px 1px 1px rgb(0,0,0,0.2)"
            bg="white"
            zIndex={1}
            aria-label="open sidebar"
            icon={
              isSidebarOpen ? <ArrowLeftIcon w="3" h="3" /> : <HamburgerIcon />
            }
            variant="outline"
            borderRadius={0}
            border="0"
            onClick={setSidebarOpen.toggle}
            bgColor="white"
          />
          <Flex p={2}>
            <Button disabled={!isDataChanged} onClick={openSaveModal}>
              Save
            </Button>
          </Flex>
        </Flex>

        <Table />
      </Flex>
      <SaveEditingModal />

      {!branch && <BranchFormModal repo={editingRepo} />}
    </Flex>
  );
};

export default memo(Repo);
