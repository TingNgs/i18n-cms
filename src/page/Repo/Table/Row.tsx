import { CSSProperties, memo } from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { useAppSelector } from '../../../redux/store';
import TableRow from './component/TableRow';
import { currentLocaleIdsSelector } from '../../../redux/selector';

const Row = ({
  index,
  style,
  data
}: {
  index: number;
  style: CSSProperties;
  data: { duplicatedKeys: { [id: string]: number } };
}) => {
  const realIndex = index - 1;
  const id = useAppSelector(
    (state) => currentLocaleIdsSelector(state)[realIndex]
  );
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
          duplicatedKeys={data.duplicatedKeys}
        />
      )}
    </Draggable>
  );
};

export default memo(Row);
