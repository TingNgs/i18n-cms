import { memo, useCallback } from 'react';
import { Text, Flex, IconButton, useBreakpointValue } from '@chakra-ui/react';
import {
  DeleteIcon,
  DragHandleIcon,
  ViewIcon,
  ViewOffIcon
} from '@chakra-ui/icons';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DraggableProvided } from 'react-beautiful-dnd';

import { useAppSelector } from '../../../redux/store';
import {
  removeLanguage,
  setLanguageSelected
} from '../../../redux/editingRepoSlice';
import PopoverDeleteBtn from '../../../component/PopoverDeleteBtn';

const Language = ({
  language,
  provided
}: {
  language: string;
  provided: DraggableProvided;
}) => {
  const { t: repoT } = useTranslation('repo');
  const isMd = useBreakpointValue({ base: false, md: true });
  const dispatch = useDispatch();

  const isSelected = useAppSelector(
    (state) => state.EditingRepoReducer.selectedLanguagesMap[language]
  );

  const onViewClicked = useCallback(() => {
    dispatch(setLanguageSelected({ language, value: !isSelected }));
  }, [language, isSelected]);

  const onDeleteClicked = useCallback(() => {
    dispatch(removeLanguage(language));
  }, [language]);

  return (
    <Flex
      data-e2e-id="language"
      ref={provided.innerRef}
      {...provided.draggableProps}
      alignItems="center">
      <Flex {...provided.dragHandleProps} p={2} data-e2e-id="drag_handler">
        <DragHandleIcon w="3" h="3" />
      </Flex>
      <Text flex="1" noOfLines={2}>
        {language}
      </Text>
      {isMd && (
        <IconButton
          colorScheme="gray"
          data-visible={isSelected}
          aria-label="toggle language"
          size="sm"
          variant="ghost"
          icon={isSelected ? <ViewIcon /> : <ViewOffIcon />}
          onClick={onViewClicked}
        />
      )}
      <PopoverDeleteBtn
        onConfirm={onDeleteClicked}
        title={
          <Text
            dangerouslySetInnerHTML={{
              __html: repoT('Delete language', { language })
            }}
          />
        }
        content={
          <Text
            dangerouslySetInnerHTML={{
              __html: repoT('Delete language confirmation', { language })
            }}
          />
        }>
        <IconButton
          colorScheme="red"
          aria-label="delete language"
          size="sm"
          variant="ghost"
          icon={<DeleteIcon />}
        />
      </PopoverDeleteBtn>
    </Flex>
  );
};

export default memo(Language);
