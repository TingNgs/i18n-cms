import { memo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Flex, useBoolean, useBreakpointValue } from '@chakra-ui/react';

import { useAppDispatch, useAppSelector } from '../../redux/store';
import { closeEditingRepo } from '../../redux/editingRepoSlice';

import BranchFormModal from './BranchFormModal';
import Sidebar from './Sidebar';
import Table from './Table';
import SaveEditingModal from './SaveEditingModal';
import Header from './Header';

import { SIDEBAR_WIDTH } from './constants';

const Repo = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isSidebarOpen, setSidebarOpen] = useBoolean(true);
  const history = useHistory();
  const dispatch = useAppDispatch();

  const { editingRepo, branch } = useAppSelector((state) => ({
    editingRepo: state.EditingRepoReducer.editingRepo,
    branch: state.EditingRepoReducer.branch
  }));

  useEffect(() => {
    if (!editingRepo) history.push('/menu');
  }, [editingRepo, history]);

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
      paddingLeft={isSidebarOpen && !isMobile ? `${SIDEBAR_WIDTH}px` : 0}>
      <Sidebar isOpen={isSidebarOpen} onClose={setSidebarOpen.off} />
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
