import { Stack } from '@chakra-ui/react';
import { useCallback } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult
} from 'react-beautiful-dnd';
import { setLanguages } from '../../../redux/editingRepoSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import reorder from '../../../utils/reorder';

import Language from './Language';

const LanguageList = () => {
  const dispatch = useAppDispatch();
  const { languages } = useAppSelector((state) => state.EditingRepoReducer);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (
        !result.destination ||
        result.source.index === result.destination.index
      ) {
        return;
      }

      const data = reorder(
        languages,
        result.source.index,
        result.destination.index
      );

      dispatch(setLanguages(data));
    },
    [languages]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable
        droppableId="languages_list"
        renderClone={(provided, snapshot, rubric) => (
          <Language
            provided={provided}
            language={languages[rubric.source.index]}
          />
        )}>
        {(provided) => (
          <Stack {...provided.droppableProps} ref={provided.innerRef}>
            {languages.map((language, index) => (
              <Draggable index={index} key={language} draggableId={language}>
                {(provided) => (
                  <Language provided={provided} language={language} />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default LanguageList;
