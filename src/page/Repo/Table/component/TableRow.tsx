import { CSSProperties, memo, useCallback } from 'react';
import { type DraggableProvided } from 'react-beautiful-dnd';
import {
  useBoolean,
  IconButton,
  Flex,
  useBreakpointValue
} from '@chakra-ui/react';
import { AddIcon, DragHandleIcon } from '@chakra-ui/icons';

import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import {
  duplicatedKeySelector,
  isSearchResultSelector,
  selectedLanguagesSelector
} from '../../../../redux/selector';
import { addLocaleAfterIndex } from '../../../../redux/editingRepoSlice';

import KeyCell from './KeyCell';
import ActionCell from './ActionCell';
import TableCell from './TableCell';

import { CELL_PROPS, ROW_PROPS } from '../../constants';

const TableRow = ({
  style,
  provided,
  isDragging,
  localeId,
  index
}: {
  style: CSSProperties;
  provided: DraggableProvided;
  isDragging: boolean;
  localeId: string;
  index: number;
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const dispatch = useAppDispatch();
  const isSearchResult = useAppSelector(isSearchResultSelector);
  const languages = useAppSelector(selectedLanguagesSelector);
  const duplicatedKeys = useAppSelector(duplicatedKeySelector);
  const localeKey = useAppSelector(
    (state) =>
      state.EditingRepoReducer.modifiedLocalesData[
        state.EditingRepoReducer.selectedNamespace || ''
      ][localeId]['key']
  );
  const [isRowHover, setRowHover] = useBoolean();

  const onAddButtonClicked = useCallback(() => {
    dispatch(addLocaleAfterIndex({ index }));
  }, [index]);

  return (
    <Flex
      {...ROW_PROPS}
      data-is-dragging={isDragging}
      onMouseEnter={setRowHover.on}
      onMouseLeave={setRowHover.off}
      {...provided.draggableProps}
      ref={provided.innerRef}
      style={{
        ...style,
        ...provided.draggableProps.style,
        minWidth: 'fit-content'
      }}>
      <Flex
        {...CELL_PROPS}
        {...(isMobile ? { minWidth: undefined } : {})}
        position="sticky"
        left="0"
        zIndex={1}
        gap={1}>
        <Flex
          {...provided.dragHandleProps}
          marginRight="2"
          visibility={isSearchResult ? 'hidden' : 'visible'}
          pointerEvents={isSearchResult ? 'none' : 'all'}>
          <DragHandleIcon w="3" h="3" />
        </Flex>

        <KeyCell
          isMobile={!!isMobile}
          localeId={localeId}
          isDuplicated={!!duplicatedKeys[localeKey]}
          localeKey={localeKey}
        />
      </Flex>

      {!isMobile &&
        languages.map((language) => (
          <TableCell key={language} language={language} localeId={localeId} />
        ))}
      <ActionCell localeId={localeId} localeKey={localeKey} index={index} />
      {!isMobile && isRowHover && !isSearchResult && (
        <IconButton
          onClick={onAddButtonClicked}
          isRound
          colorScheme="green"
          size="xs"
          aria-label="add"
          position="absolute"
          zIndex={2}
          left="0"
          bottom={0}
          transform="translateY(50%)"
          icon={<AddIcon />}
        />
      )}
    </Flex>
  );
};

export default memo(TableRow);
