import { memo, useCallback } from 'react';
import { Editable, EditableInput, EditablePreview } from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import { get } from 'lodash-es';

import { Cell } from './View';
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
  (state: RootState, language: string, localeKey: string) => localeKey,
  (selectedNamespace, modifiedLocalesData, language, localeKey) =>
    selectedNamespace &&
    get(modifiedLocalesData, [selectedNamespace, language, localeKey], '')
);

const TableCell = ({
  language,
  localeKey
}: {
  language: string;
  localeKey: string;
}) => {
  const dispatch = useAppDispatch();
  const value = useAppSelector((state) =>
    localeSelector(state, language, localeKey)
  );

  const onSubmit = useCallback(
    (value: string) => {
      dispatch(handleLocaleOnChange({ value, language, localeKey }));
    },
    [language, localeKey]
  );

  return (
    <Cell>
      <Editable defaultValue={value} w="100%" onChange={onSubmit}>
        <EditablePreview w="100%" overflow="hidden" noOfLines={2} />
        <EditableInput />
      </Editable>
    </Cell>
  );
};

export default memo(TableCell);
