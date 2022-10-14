import { memo, useEffect, HTMLProps, forwardRef, useCallback } from 'react';
import { Flex, Spinner, Text } from '@chakra-ui/react';
import { DragHandleIcon } from '@chakra-ui/icons';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  Droppable,
  DragDropContext,
  type DropResult
} from 'react-beautiful-dnd';

import { useAppDispatch, useAppSelector } from '../../../redux/store';
import useGetEditingRepoLocalByNs from '../hooks/useGetEditingRepoLocalByNs';
import {
  setLocalesDataByNamespace,
  setNamespaceLocales
} from '../../../redux/editingRepoSlice';

import Row from './Row';
import TableRow from './TableRow';
import { ROW_PROPS, CELL_PROPS, LIST_PADDING_BOTTOM } from './constants';
import { CELL_HEIGHT } from '../../../constants';
import reorder from '../../../utils/reorder';

const Inner = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  function Inner({ children, style, ...rest }, ref) {
    const languages = useAppSelector(
      (state) => state.EditingRepoReducer.selectedLanguages
    );
    return (
      <div
        {...rest}
        style={{
          ...style,
          height: `${
            parseFloat(style?.height?.toString() || '0') + LIST_PADDING_BOTTOM
          }px`
        }}
        ref={ref}>
        <Flex {...ROW_PROPS} position="sticky" top="0" zIndex={2}>
          <Flex {...CELL_PROPS} flex="none" flexShrink={0} minWidth="0">
            <DragHandleIcon w="3" h="3" visibility="hidden" />
          </Flex>
          <Flex {...CELL_PROPS} position="sticky" left="0" zIndex={1}>
            <Text fontWeight="bold">Key</Text>
          </Flex>
          {languages.map((language) => (
            <Flex {...CELL_PROPS} fontWeight="bold" key={language} flex={1}>
              <Text>{language}</Text>
            </Flex>
          ))}
        </Flex>
        {children}
      </div>
    );
  }
);

const LocaleTable = () => {
  const modifiedLocalesData = useAppSelector(
    (state) => state.EditingRepoReducer.modifiedLocalesData
  );
  const namespace = useAppSelector(
    (state) => state.EditingRepoReducer.selectedNamespace
  );
  const listSize = useAppSelector(
    (state) =>
      (namespace &&
        state.EditingRepoReducer.modifiedLocalesData[namespace]?.length) ||
      0
  );

  const dispatch = useAppDispatch();
  const getEditingRepoLocalByNs = useGetEditingRepoLocalByNs();

  useEffect(() => {
    const fetchNamespaceData = async () => {
      if (!namespace) return;
      const data = await getEditingRepoLocalByNs({
        namespace: namespace
      });
      if (!data) return;
      dispatch(setLocalesDataByNamespace({ namespace, data }));
    };

    if (namespace && !modifiedLocalesData[namespace]) {
      fetchNamespaceData();
    }
  }, [namespace, modifiedLocalesData]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (
        !result.destination ||
        !namespace ||
        result.source.index === result.destination.index
      ) {
        return;
      }

      const data = reorder(
        modifiedLocalesData[namespace],
        result.source.index,
        result.destination.index
      );

      dispatch(setNamespaceLocales({ data, namespace }));
    },
    [namespace, modifiedLocalesData]
  );

  if (!namespace) return null;

  return (
    <Flex flexGrow={1} overflow="scroll">
      {listSize > 0 ? (
        <AutoSizer>
          {({ height, width }) => (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable
                droppableId="droppable"
                mode="virtual"
                renderClone={(provided, snapshot, rubric) => (
                  <TableRow
                    provided={provided}
                    isDragging={snapshot.isDragging}
                    style={{ margin: 0 }}
                    index={rubric.source.index}
                    localeKey={
                      modifiedLocalesData[namespace][rubric.source.index].key
                    }
                  />
                )}>
                {(provided) => (
                  <List
                    key={namespace}
                    height={height}
                    itemCount={listSize + 1}
                    itemSize={CELL_HEIGHT}
                    width={width}
                    innerElementType={Inner}
                    outerRef={provided.innerRef}>
                    {Row}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </AutoSizer>
      ) : (
        <Flex flex="1" alignItems="center" justifyContent="center">
          <Spinner />
        </Flex>
      )}
    </Flex>
  );
};

export default memo(LocaleTable);
