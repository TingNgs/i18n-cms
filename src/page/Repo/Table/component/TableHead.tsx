import { memo } from 'react';
import { Flex, Text, useBreakpointValue } from '@chakra-ui/react';
import { DragHandleIcon } from '@chakra-ui/icons';

import { useAppSelector } from '../../../../redux/store';

import { ROW_PROPS, CELL_PROPS } from '../../constants';
import ActionCell from './ActionCell';
import { selectedLanguagesSelector } from '../../../../redux/selector';

const TableHead = () => {
  const isMd = useBreakpointValue({ base: false, md: true });
  const languages = useAppSelector(selectedLanguagesSelector);
  return (
    <Flex
      {...ROW_PROPS}
      data-e2e-id="table_head"
      position="sticky"
      top="0"
      zIndex={3}>
      <Flex
        {...CELL_PROPS}
        data-e2e-id="table_cell"
        position="sticky"
        left="0"
        zIndex={1}
        gap="1">
        <Flex marginRight="2" visibility="hidden">
          <DragHandleIcon w="3" h="3" />
        </Flex>
        <Text fontWeight="bold">Key</Text>
      </Flex>
      {isMd &&
        languages.map((language) => (
          <Flex
            {...CELL_PROPS}
            data-e2e-id="table_cell"
            fontWeight="bold"
            key={language}
            flex={1}>
            <Text noOfLines={2}>{language}</Text>
          </Flex>
        ))}
      <ActionCell />
    </Flex>
  );
};

export default memo(TableHead);
