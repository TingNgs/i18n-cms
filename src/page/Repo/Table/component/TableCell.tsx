import { memo, useCallback, useEffect, useRef } from 'react';
import {
  Editable,
  EditablePreview,
  EditableTextarea,
  Flex
} from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import { get } from 'lodash-es';

import { CELL_PROPS } from '../../constants';
import {
  RootState,
  useAppDispatch,
  useAppSelector
} from '../../../../redux/store';
import { handleLocaleOnChange } from '../../../../redux/editingRepoSlice';

const localeSelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.selectedNamespace,
  (state: RootState) => state.EditingRepoReducer.modifiedLocalesData,
  (state: RootState, language: string) => language,
  (state: RootState, language: string, localeId: string) => localeId,
  (selectedNamespace, modifiedLocalesData, language, localeId) =>
    selectedNamespace &&
    get(
      modifiedLocalesData,
      [selectedNamespace, localeId, 'value', language],
      ''
    )
);

const TEXTAREA_MIN_HEIGHT = 32;
const TEXTAREA_MAX_HEIGHT = 56;

const TableCell = ({
  language,
  localeId
}: {
  language: string;
  localeId: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const dispatch = useAppDispatch();
  const value = useAppSelector((state) =>
    localeSelector(state, language, localeId)
  );

  const onSubmit = useCallback(
    (value: string) => {
      dispatch(handleLocaleOnChange({ value, language, localeId }));
    },
    [language, localeId]
  );

  useEffect(() => {
    if (textareaRef.current && previewRef.current) {
      textareaRef.current.style.height = `${previewRef.current.clientHeight}px`;
    }
  }, []);

  const onChange = useCallback((value: string) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = `${TEXTAREA_MIN_HEIGHT}px`;
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        TEXTAREA_MAX_HEIGHT
      )}px`;
    }
    onSubmit(value);
  }, []);

  return (
    <Flex {...CELL_PROPS}>
      <Editable
        value={value}
        w="100%"
        minH={`${TEXTAREA_MIN_HEIGHT}px`}
        onChange={onChange}>
        <EditablePreview
          ref={previewRef}
          w="100%"
          minH={`${TEXTAREA_MIN_HEIGHT}px`}
          overflow="hidden"
          noOfLines={2}
        />
        <EditableTextarea ref={textareaRef} />
      </Editable>
    </Flex>
  );
};

export default memo(TableCell);
