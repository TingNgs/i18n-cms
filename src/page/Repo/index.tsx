import { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Stack, Text } from '@chakra-ui/react';

import { useAppSelector } from '../../redux/store';

import BranchFormModal from './BranchFormModal';
import Sidebar from './Namespaces';

const Repo = () => {
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
    <Flex overflow="hidden">
      <Sidebar />

      <Stack flexGrow={1} overflow="scroll">
        <Text>1</Text>
        <Text>1</Text>
        <Text>1</Text>
        <Text>1</Text>
        <Text>1</Text>
        <Text>1</Text>
        <Text>1</Text>
        <Text>1</Text>
        <Text>1</Text>
        <Text>1</Text>
        <Text>1</Text>
        <Text>1</Text>
        <Text>1</Text>
        <Text>1</Text>
        <Text>1</Text>
        <Text>1</Text>
      </Stack>

      {!branch && <BranchFormModal repo={editingRepo} />}
    </Flex>
  );
};

export default memo(Repo);
