import { memo, useCallback } from 'react';
import { Text, Flex, IconButton, useBreakpointValue } from '@chakra-ui/react';
import {
  DeleteIcon,
  DragHandleIcon,
  ViewIcon,
  ViewOffIcon
} from '@chakra-ui/icons';
import { useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

import { RootState, useAppSelector } from '../../../redux/store';
import { useTranslation } from 'react-i18next';
import {
  removeLanguage,
  setLanguageSelected
} from '../../../redux/editingRepoSlice';
import PopoverDeleteBtn from '../../../component/PopoverDeleteBtn';
import { DraggableProvided } from 'react-beautiful-dnd';

const isLanguageSelectedSelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.selectedLanguagesMap,
  (state: RootState, language: string) => language,
  (selectedLanguagesMap, language) => selectedLanguagesMap[language]
);

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

  const isSelected = useAppSelector((state) =>
    isLanguageSelectedSelector(state, language)
  );

  const onViewClicked = useCallback(() => {
    dispatch(setLanguageSelected({ language, value: !isSelected }));
  }, [language, isSelected]);

  const onDeleteClicked = useCallback(() => {
    dispatch(removeLanguage(language));
  }, [language]);

  return (
    <Flex
      ref={provided.innerRef}
      {...provided.draggableProps}
      alignItems={'center'}>
      <Flex {...provided.dragHandleProps} p={2}>
        <DragHandleIcon w="3" h="3" />
      </Flex>
      <Text flex="1" noOfLines={2}>
        {language}
      </Text>
      {isMd && (
        <IconButton
          colorScheme="gray"
          aria-label="show-language"
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
          aria-label="show-language"
          size="sm"
          variant="ghost"
          icon={<DeleteIcon />}
        />
      </PopoverDeleteBtn>
    </Flex>
  );
};

export default memo(Language);
