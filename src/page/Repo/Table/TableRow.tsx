import { CSSProperties, memo } from 'react';
import { type DraggableProvided } from 'react-beautiful-dnd';
import { useBoolean, IconButton, Flex } from '@chakra-ui/react';
import { AddIcon, DragHandleIcon } from '@chakra-ui/icons';

import { useAppSelector } from '../../../redux/store';
import { duplicatedKeySelector } from '../../../redux/selector';
import KeyCell from './KeyCell';
import TableCell from './TableCell';
import { CELL_PROPS, ROW_PROPS } from './constants';

const TableRow = ({
  style,
  provided,
  isDragging,
  localeId
}: {
  style: CSSProperties;
  provided: DraggableProvided;
  isDragging: boolean;
  localeId: string;
}) => {
  const languages = useAppSelector(
    (state) => state.EditingRepoReducer.selectedLanguages
  );
  const duplicatedKeys = useAppSelector(duplicatedKeySelector);
  const localeKey = useAppSelector(
    (state) =>
      state.EditingRepoReducer.modifiedLocalesData[
        state.EditingRepoReducer.selectedNamespace || ''
      ][localeId]['key']
  );
  const [isRowHover, setRowHover] = useBoolean();

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
        {...provided.dragHandleProps}
        {...CELL_PROPS}
        flex="none"
        flexShrink={0}
        minWidth="0">
        <DragHandleIcon w="3" h="3" />
      </Flex>
      <KeyCell
        localeId={localeId}
        isDuplicated={!!duplicatedKeys[localeKey]}
        localeKey={localeKey}
      />
      {languages.map((language) => (
        <TableCell key={language} language={language} localeId={localeId} />
      ))}

      {isRowHover && (
        <IconButton
          isRound
          colorScheme={'green'}
          size="xs"
          aria-label="add"
          position="absolute"
          zIndex={1}
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
