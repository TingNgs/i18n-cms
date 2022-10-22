import { memo, useCallback } from 'react';

import { Button, ButtonGroup, Flex, IconButton, Text } from '@chakra-ui/react';
import { ArrowLeftIcon, HamburgerIcon, AddIcon } from '@chakra-ui/icons';

import SaveButton from './SaveButton';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import ActionButton from './ActionButton';
import { addLocaleAfterIndex } from '../../../redux/editingRepoSlice';

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
    <Flex w="100%" justifyContent="space-between" flexWrap="wrap">
      <IconButton
        w="56px"
        h="56px"
        position="relative"
        right="1px"
        boxShadow="1px 1px 1px rgb(0,0,0,0.2)"
        bg="white"
        zIndex={1}
        aria-label="open sidebar"
        icon={isSidebarOpen ? <ArrowLeftIcon w="3" h="3" /> : <HamburgerIcon />}
        variant="outline"
        borderRadius={0}
        border="0"
        onClick={setSidebarOpen.toggle}
        bgColor="white"
      />
      <Flex p={2} flex={1} alignItems="center" gap={2} flexWrap="wrap">
        <Text fontWeight="bold">{selectedNamespace}</Text>
        <Flex flex={1} justifyContent="flex-end" gap={2}>
          <ButtonGroup isAttached>
            <Button
              disabled={!selectedNamespace}
              colorScheme="green"
              leftIcon={<AddIcon w="3" h="3" />}
              onClick={onAddKeyClicked}>
              Key
            </Button>
            <ActionButton setSidebarOpen={setSidebarOpen} />
          </ButtonGroup>

          <SaveButton />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default memo(Header);
