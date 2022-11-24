import React, {
  KeyboardEventHandler,
  memo,
  useCallback,
  useEffect
} from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDownIcon, ArrowUpIcon, SearchIcon } from '@chakra-ui/icons';
import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text
} from '@chakra-ui/react';

import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { onNextMatch, setFindText } from '../../../../redux/editingRepoSlice';
import useFindMatches from './useFindMatches';

const SearchBar = () => {
  const { t } = useTranslation('repo');
  const dispatch = useAppDispatch();

  useFindMatches();

  const { findText, selectedNamespace, findMatches, selectedMatch } =
    useAppSelector((state) => ({
      findText: state.EditingRepoReducer.findText,
      selectedNamespace: state.EditingRepoReducer.selectedNamespace,
      findMatches: state.EditingRepoReducer.findMatches,
      selectedMatch: state.EditingRepoReducer.selectedMatch
    }));

  useEffect(() => {
    dispatch(setFindText({ text: '' }));
  }, [selectedNamespace]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    dispatch(setFindText({ text }));
  }, []);

  const onPrevClicked = useCallback(() => {
    dispatch(onNextMatch({ step: -1 }));
  }, []);

  const onNextClicked = useCallback(() => {
    dispatch(onNextMatch({ step: 1 }));
  }, []);

  const onInputKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          dispatch(onNextMatch({ step: -1 }));
        } else {
          dispatch(onNextMatch({ step: 1 }));
        }
      }
    },
    []
  );

  return (
    <InputGroup size="sm">
      <InputLeftElement>
        <SearchIcon />
      </InputLeftElement>
      <Input
        value={findText}
        onChange={onChange}
        disabled={!selectedNamespace}
        borderRadius="5"
        placeholder={t('Search by key or value')}
        onKeyDown={onInputKeyDown}
      />
      <InputRightElement w="auto">
        <IconButton
          variant="ghost"
          icon={<ArrowUpIcon />}
          aria-label="search prev button"
          size="sm"
          disabled={!selectedNamespace}
          onClick={onPrevClicked}
        />
        <IconButton
          variant="ghost"
          icon={<ArrowDownIcon />}
          aria-label="search next button"
          size="sm"
          disabled={!selectedNamespace}
          onClick={onNextClicked}
        />
        {!!findText && (
          <Text paddingRight={2} paddingLeft={2}>
            {selectedMatch ? selectedMatch.index + 1 : 0} /{' '}
            {findMatches?.length || 0}
          </Text>
        )}
      </InputRightElement>
    </InputGroup>
  );
};

export default memo(SearchBar);
