import { CSSProperties, memo } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { Draggable } from 'react-beautiful-dnd';

import { RootState, useAppSelector } from '../../../redux/store';
import TableRow from './TableRow';

const keySelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.modifiedLocalesData,
  (state: RootState) => state.EditingRepoReducer.selectedNamespace,
  (state: RootState, index: number) => index,
  (modifiedLocalesData, selectedNamespace, index) =>
    index >= 0 &&
    selectedNamespace &&
    index < modifiedLocalesData[selectedNamespace].length
      ? {
          id: modifiedLocalesData[selectedNamespace][index]['id'],
          key: modifiedLocalesData[selectedNamespace][index]['key']
        }
      : { id: '', key: '' }
);

const Row = ({ index, style }: { index: number; style: CSSProperties }) => {
  const { id, key } = useAppSelector((state) => keySelector(state, index - 1));
  if (index === 0) return null;
  const realIndex = index - 1;
  return (
    <Draggable key={id} draggableId={id} index={realIndex}>
      {(provided, snapshot) => (
        <TableRow
          provided={provided}
          isDragging={snapshot.isDragging}
          index={realIndex}
          style={style}
          localeKey={key}
        />
      )}
    </Draggable>
  );
};

export default memo(Row);
