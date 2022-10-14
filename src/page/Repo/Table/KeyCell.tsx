import { memo, useCallback } from 'react';
import {
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Tooltip
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

import { CELL_PROPS } from './constants';
import { useAppDispatch } from '../../../redux/store';
import { handleLocaleKeyOnChange } from '../../../redux/editingRepoSlice';

const TableCell = ({
  index,
  localeKey,
  isDuplicated
}: {
  index: number;
  localeKey: string;
  isDuplicated: boolean;
}) => {
  const { t } = useTranslation('repo');
  const dispatch = useAppDispatch();

  const onSubmit = useCallback(
    (value: string) => {
      if (value === localeKey) return;
      dispatch(handleLocaleKeyOnChange({ value, index }));
    },
    [localeKey, index]
  );

  return (
    <Flex {...CELL_PROPS} position="sticky" left="0" zIndex={1} gap={1}>
      <Editable defaultValue={localeKey} w="100%" onChange={onSubmit}>
        <EditablePreview
          w="100%"
          overflow="hidden"
          fontWeight="bold"
          noOfLines={2}
        />
        <EditableInput />
      </Editable>

      {isDuplicated && (
        <Tooltip hasArrow label={t('Duplicated key')} background="red.500">
          <WarningIcon w="4" h="4" color="red.500" />
        </Tooltip>
      )}
    </Flex>
  );
};

export default memo(TableCell);
