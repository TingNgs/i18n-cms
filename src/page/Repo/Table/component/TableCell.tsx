import { memo, useCallback } from 'react';
import {
  Editable,
  EditableInput,
  EditablePreview,
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
  (state: RootState) => state.EditingRepoReducer.localeIds,
  (state: RootState) => state.EditingRepoReducer.modifiedLocalesData,
  (state: RootState, language: string) => language,
  (state: RootState, language: string, localeId: string) => localeId,
  (selectedNamespace, localeIds, modifiedLocalesData, language, localeId) =>
    selectedNamespace &&
    get(
      modifiedLocalesData,
      [selectedNamespace, localeId, 'value', language],
      ''
    )
);

const TableCell = ({
  language,
  localeId
}: {
  language: string;
  localeId: string;
}) => {
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
