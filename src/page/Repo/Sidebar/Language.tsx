import { memo, useCallback } from 'react';
import { Text, Flex, IconButton, useDisclosure } from '@chakra-ui/react';
import { DeleteIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

import { RootState, useAppSelector } from '../../../redux/store';
import { useTranslation } from 'react-i18next';
import {
  removeLanguage,
  setLanguageSelected
} from '../../../redux/editingRepoSlice';
import PopoverDeleteBtn from '../../../component/PopoverDeleteBtn';

const isLanguageSelectedSelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.selectedLanguagesMap,
  (state: RootState, language: string) => language,
  (selectedLanguagesMap, language) => selectedLanguagesMap[language]
);

const Language = ({ language }: { language: string }) => {
  const { t: repoT } = useTranslation('repo');
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    <Flex alignItems={'center'}>
      <IconButton
        colorScheme="gray"
        aria-label="show-language"
        size="sm"
        variant="ghost"
        icon={isSelected ? <ViewIcon /> : <ViewOffIcon />}
        onClick={onViewClicked}
      />
      <Text flex="1">{language}</Text>

      <PopoverDeleteBtn
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
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
