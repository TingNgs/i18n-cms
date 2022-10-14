import { CSSProperties, memo } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { Draggable } from 'react-beautiful-dnd';

import { RootState, useAppSelector } from '../../../redux/store';
import TableRow from './TableRow';

const idSelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.localeIds,
  (state: RootState) => state.EditingRepoReducer.selectedNamespace,
  (state: RootState, index: number) => index,
  (localeIds, selectedNamespace, index) =>
    index >= 0 &&
    selectedNamespace &&
    index < localeIds[selectedNamespace].length
      ? localeIds[selectedNamespace][index]
      : null
);

const Row = ({ index, style }: { index: number; style: CSSProperties }) => {
  const realIndex = index - 1;
  const id = useAppSelector((state) => idSelector(state, realIndex));
  if (index === 0 || !id) return null;

  return (
    <Draggable key={id} draggableId={id} index={realIndex}>
      {(provided, snapshot) => (
        <TableRow
          provided={provided}
          isDragging={snapshot.isDragging}
          style={style}
          localeId={id}
          index={realIndex}
        />
      )}
    </Draggable>
  );
};

export default memo(Row);
