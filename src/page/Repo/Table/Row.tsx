import { CSSProperties, memo } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { Draggable } from 'react-beautiful-dnd';

import { RootState, useAppSelector } from '../../../redux/store';
import TableRow from './component/TableRow';
import { currentLocaleIdsSelector } from '../../../redux/selector';

const idSelector = createSelector(
  (state: RootState) => currentLocaleIdsSelector(state),
  (state: RootState, index: number) => index,
  (currentLocaleId, index) =>
    index >= 0 && index < currentLocaleId.length ? currentLocaleId[index] : null
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
