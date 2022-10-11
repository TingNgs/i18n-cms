import { Text, Flex } from '@chakra-ui/react';
import { memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedNamespaces } from '../../../redux/editingRepoSlice';

const Namespaces = ({
  namespace,
  isSelected
}: {
  namespace: string;
  isSelected: boolean;
}) => {
  const dispatch = useDispatch();
  const onClick = useCallback(() => {
    dispatch(setSelectedNamespaces(namespace));
  }, [namespace]);
  return (
    <Flex
      onClick={onClick}
      p={2}
      backgroundColor={isSelected ? 'blue.500' : undefined}
      cursor="pointer">
      <Text color={isSelected ? 'white' : 'blue.500'}>{namespace}</Text>
    </Flex>
  );
};

export default memo(Namespaces);
