import { memo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Flex, useBoolean } from '@chakra-ui/react';

import { useAppDispatch, useAppSelector } from '../../redux/store';

import BranchFormModal from './BranchFormModal';
import Sidebar from './Sidebar';
import Table from './Table';

import SaveEditingModal from './SaveEditingModal';
import { closeEditingRepo } from '../../redux/editingRepoSlice';

import { SIDEBAR_WIDTH } from './constants';
import Header from './Header';

const Repo = () => {
  const [isSidebarOpen, setSidebarOpen] = useBoolean(true);
  const history = useHistory();
  const dispatch = useAppDispatch();

  const { editingRepo, branch } = useAppSelector((state) => ({
    editingRepo: state.EditingRepoReducer.editingRepo,
    branch: state.EditingRepoReducer.branch
  }));

  useEffect(() => {
    if (!editingRepo) history.push('/dashboard');
  }, [editingRepo]);

  useEffect(() => {
    return () => {
      dispatch(closeEditingRepo());
    };
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
        <Header isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Table />
      </Flex>
      <SaveEditingModal />

      {!branch && <BranchFormModal repo={editingRepo} />}
    </Flex>
  );
};

export default memo(Repo);
