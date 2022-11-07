import { memo, useCallback } from 'react';
import { Button, ButtonGroup, Flex, IconButton, Text } from '@chakra-ui/react';
import { ArrowLeftIcon, HamburgerIcon, AddIcon } from '@chakra-ui/icons';

import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { addLocaleAfterIndex } from '../../../redux/editingRepoSlice';

import SaveButton from './SaveButton';
import ActionButton from './ActionButton';
import SearchBar from './SearchBar';

const Header = ({
  isSidebarOpen,
  setSidebarOpen
}: {
  isSidebarOpen: boolean;
  setSidebarOpen: { toggle: () => void; on: () => void; off: () => void };
}) => {
  const dispatch = useAppDispatch();
  const selectedNamespace = useAppSelector(
    (state) => state.EditingRepoReducer.selectedNamespace
  );

  const onAddKeyClicked = useCallback(() => {
    dispatch(addLocaleAfterIndex({}));
  }, []);

  return (
    <Flex>
      <Flex flex="1" alignItems="center" p="0 8px" gap={2} flexWrap="wrap">
        <IconButton
          w="56px"
          h="56px"
          position="relative"
          right="8px"
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
          order={1}
        />
        <Text fontWeight="bold" order={2}>
          {selectedNamespace}
        </Text>
        <ButtonGroup
          isAttached
          justifyContent="flex-end"
          order={3}
          flex={{ base: 1, md: 0 }}>
          <Button
            disabled={!selectedNamespace}
            colorScheme="green"
            leftIcon={<AddIcon w="3" h="3" />}
            onClick={onAddKeyClicked}>
            Key
          </Button>
          <ActionButton setSidebarOpen={setSidebarOpen} />
        </ButtonGroup>
        <Flex order={4}>
          <SaveButton />
        </Flex>
        <Flex
          order={{ base: 5, md: 2 }}
          flex={1}
          minW={{ base: '100%', md: 'auto' }}>
          <SearchBar />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default memo(Header);
