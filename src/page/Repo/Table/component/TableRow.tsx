import { CSSProperties, memo, useCallback } from 'react';
import { type DraggableProvided } from 'react-beautiful-dnd';
import {
  useBoolean,
  IconButton,
  Flex,
  useBreakpointValue
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import {
  isSearchResultSelector,
  selectedLanguagesSelector
} from '../../../../redux/selector';
import { addLocaleAfterIndex } from '../../../../redux/editingRepoSlice';

import KeyCell from './KeyCell';
import ActionCell from './ActionCell';
import TableCell from './TableCell';

import { ROW_PROPS } from '../../constants';

const TableRow = ({
  style,
  provided,
  isDragging,
  localeId,
  index,
  duplicatedKeys
}: {
  style: CSSProperties;
  provided: DraggableProvided;
  isDragging: boolean;
  localeId: string;
  index: number;
  duplicatedKeys?: { [id: string]: number };
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const dispatch = useAppDispatch();
  const isSearchResult = useAppSelector(isSearchResultSelector);
  const languages = useAppSelector(selectedLanguagesSelector);

  const isSelectedRow = useAppSelector(
    (state) => state.EditingRepoReducer.selectedMatch?.row === index
  );
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
      {...(isSelectedRow
        ? {
            _before: {
              content: '""',
              position: 'absolute',
              w: '100%',
              h: '100%',
              bg: 'text--selected',
              left: 0,
              top: 0,
              pointerEvents: 'none',
              zIndex: 2
            }
          }
        : {})}
      style={{
        ...style,
        ...provided.draggableProps.style,
        minWidth: 'fit-content'
      }}>
      <KeyCell
        isMobile={!!isMobile}
        localeId={localeId}
        isDuplicated={!!duplicatedKeys?.[localeKey]}
        localeKey={localeKey}
        provided={provided}
      />

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
          aria-label="add locale"
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
