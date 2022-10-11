import { Stack, Text } from '@chakra-ui/react';
import { useAppSelector } from '../../../redux/store';
import Namespace from './Namespace';

const Namespaces = () => {
  const namespaces = useAppSelector(
    (state) => state.EditingRepoReducer.namespaces
  );
  const selectedNamespaces = useAppSelector(
    (state) => state.EditingRepoReducer.selectedNamespace
  );
  return (
    <Stack overflow="scroll" w={150}>
      <Text p={2}>Namespaces</Text>
      <Stack spacing={0}>
        {namespaces.map((namespace) => (
          <Namespace
            key={namespace}
            namespace={namespace}
            isSelected={namespace === selectedNamespaces}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default Namespaces;
