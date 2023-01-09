import React, {
  KeyboardEventHandler,
  memo,
  useCallback,
  useEffect,
  useRef
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
import { noop } from 'lodash-es';

import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { onNextMatch, setFindText } from '../../../../redux/editingRepoSlice';
import useFindMatches from './useFindMatches';

const SearchBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);
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

  const searchBarDisabled = !selectedNamespace;

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    if (e.key == 'f' && (isMac ? e.metaKey : e.ctrlKey) && inputRef.current) {
      e.preventDefault();
      const text = window.getSelection()?.toString().trim();
      inputRef.current.focus();
      if (text) {
        inputRef.current.value = text;
        dispatch(setFindText({ text }));
      }
    }
  }, []);

  useEffect(() => {
    if (searchBarDisabled) return noop;
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [searchBarDisabled, onKeyDown]);

  return (
    <InputGroup size="sm">
      <InputLeftElement>
        <SearchIcon />
      </InputLeftElement>
      <Input
        ref={inputRef}
        value={findText}
        onChange={onChange}
        disabled={searchBarDisabled}
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
