import { memo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Flex, useBoolean, useBreakpointValue } from '@chakra-ui/react';

import { useAppDispatch, useAppSelector } from '../../redux/store';
import { closeEditingRepo } from '../../redux/editingRepoSlice';

import Setup from './Setup';
import Sidebar from './Sidebar';
import Table from './Table';
import SaveEditingModal from './SaveEditingModal';
import Header from './Header';

import { SIDEBAR_WIDTH } from './constants';
import SandboxIframe from '../../component/SandboxIframe';

const Repo = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isSidebarOpen, setSidebarOpen] = useBoolean(true);
  const history = useHistory();
  const dispatch = useAppDispatch();

  const { editingRepo, showSandboxIframe, branch } = useAppSelector(
    (state) => ({
      editingRepo: state.EditingRepoReducer.editingRepo,
      branch: state.EditingRepoReducer.branch,
      showSandboxIframe: !!(
        state.EditingRepoReducer.editingRepoConfig?.useCustomPath &&
        state.EditingRepoReducer.customPathHandlerScript
      )
    })
  );

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

  if (!branch) return <Setup repo={editingRepo} />;

  return (
    <Flex
      data-e2e-id="repo"
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
      {showSandboxIframe && <SandboxIframe />}
    </Flex>
  );
};

export default memo(Repo);
