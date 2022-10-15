import { memo } from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { DragHandleIcon } from '@chakra-ui/icons';

import { useAppSelector } from '../../../redux/store';

import { ROW_PROPS, CELL_PROPS } from '../constants';
import EditButton from './EditButton';

const TableHead = () => {
  const languages = useAppSelector(
    (state) => state.EditingRepoReducer.selectedLanguages
  );
  return (
    <Flex {...ROW_PROPS} position="sticky" top="0" zIndex={2}>
      <Flex {...CELL_PROPS} position="sticky" left="0" zIndex={1} gap="1">
        <Flex marginRight="2" visibility="hidden">
          <DragHandleIcon w="3" h="3" />
        </Flex>
        <Text fontWeight="bold">Key</Text>
      </Flex>
      {languages.map((language) => (
        <Flex {...CELL_PROPS} fontWeight="bold" key={language} flex={1}>
          <Text>{language}</Text>
        </Flex>
      ))}
      <EditButton />
    </Flex>
  );
};

export default memo(TableHead);
