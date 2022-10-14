import { memo, useCallback } from 'react';
import {
  Editable,
  EditableInput,
  EditablePreview,
  Flex
} from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import { get } from 'lodash-es';

import { CELL_PROPS } from './constants';
import {
  RootState,
  useAppDispatch,
  useAppSelector
} from '../../../redux/store';
import { handleLocaleOnChange } from '../../../redux/editingRepoSlice';

const localeSelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.selectedNamespace,
  (state: RootState) => state.EditingRepoReducer.modifiedLocalesData,
  (state: RootState, language: string) => language,
  (state: RootState, language: string, index: number) => index,
  (selectedNamespace, modifiedLocalesData, language, index) =>
    selectedNamespace &&
    get(modifiedLocalesData, [selectedNamespace, index, 'value', language], '')
);

const TableCell = ({
  language,
  index
}: {
  language: string;
  index: number;
}) => {
  const dispatch = useAppDispatch();
  const value = useAppSelector((state) =>
    localeSelector(state, language, index)
  );

  const onSubmit = useCallback(
    (value: string) => {
      dispatch(handleLocaleOnChange({ value, language, index }));
    },
    [language, index]
  );

  return (
    <Flex {...CELL_PROPS}>
      <Editable defaultValue={value} w="100%" onChange={onSubmit}>
        <EditablePreview w="100%" overflow="hidden" noOfLines={2} />
        <EditableInput />
      </Editable>
    </Flex>
  );
};

export default memo(TableCell);
