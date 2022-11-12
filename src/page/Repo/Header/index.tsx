import { memo, useCallback } from 'react';
import { Button, ButtonGroup, Flex, IconButton, Text } from '@chakra-ui/react';
import { ArrowLeftIcon, HamburgerIcon, AddIcon } from '@chakra-ui/icons';

import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { addLocaleAfterIndex } from '../../../redux/editingRepoSlice';
import { isSearchResultSelector } from '../../../redux/selector';

import SaveButton from './SaveButton';
import ActionButton from './ActionButton';
import SearchBar from './SearchBar';
import FilterTags from './FilterTags';

const Header = ({
  isSidebarOpen,
  setSidebarOpen
}: {
  isSidebarOpen: boolean;
  setSidebarOpen: { toggle: () => void; on: () => void; off: () => void };
}) => {
  const dispatch = useAppDispatch();
  const { selectedNamespace } = useAppSelector((state) => ({
    selectedNamespace: state.EditingRepoReducer.selectedNamespace
  }));

  const isSearchResult = useAppSelector(isSearchResultSelector);

  const onAddKeyClicked = useCallback(() => {
    dispatch(addLocaleAfterIndex({}));
  }, []);

  return (
    <Flex flexDir="column">
      <Flex flex="1" alignItems="center" p="0 8px" gap={2} flexWrap="wrap">
        <IconButton
          w="48px"
          h="48px"
          position="relative"
          right="8px"
          boxShadow="1px 1px 1px var(--chakra-colors-chakra-border-color)"
          bg="var(--chakra-colors-chakra-body-bg)"
          zIndex={1}
          aria-label="open sidebar"
          icon={
            isSidebarOpen ? <ArrowLeftIcon w="3" h="3" /> : <HamburgerIcon />
          }
          variant="outline"
          borderRadius={0}
          border="0"
          onClick={setSidebarOpen.toggle}
          order={1}
        />
        <Text
          fontWeight="bold"
          order={2}
          noOfLines={1}
          flex={{ base: '1', md: 'unset' }}>
          {selectedNamespace}
        </Text>
        <ButtonGroup
          isAttached
          justifyContent="flex-end"
          order={3}
          flex={{ base: 1, md: 0 }}
          size="sm">
          <Button
            disabled={!selectedNamespace || isSearchResult}
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
      {isSearchResult && <FilterTags />}
    </Flex>
  );
};

export default memo(Header);
