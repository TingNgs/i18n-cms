import { memo, useCallback } from 'react';
import { Flex, Tag, TagCloseButton, Text } from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { setSearchText } from '../../../redux/editingRepoSlice';

const FilterTags = () => {
  const { t } = useTranslation('repo');
  const dispatch = useAppDispatch();
  const { searchText } = useAppSelector((state) => ({
    searchText: state.EditingRepoReducer.searchText
  }));

  const onSearchCloseBtnClicked = useCallback(() => {
    dispatch(setSearchText({ text: '' }));
  }, []);

  return (
    <Flex p="2" gap="2">
      <Text>{t('Filter')}:</Text>
      {searchText && (
        <Tag>
          {searchText}
          <TagCloseButton onClick={onSearchCloseBtnClicked} />
        </Tag>
      )}
    </Flex>
  );
};

export default memo(FilterTags);
