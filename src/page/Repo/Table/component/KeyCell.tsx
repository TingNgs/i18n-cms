import { memo, useCallback } from 'react';
import {
  Editable,
  EditableInput,
  EditablePreview,
  Tooltip
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '../../../../redux/store';
import { handleLocaleKeyOnChange } from '../../../../redux/editingRepoSlice';

const TableCell = ({
  isMobile,
  localeId,
  localeKey,
  isDuplicated
}: {
  isMobile: boolean;
  localeId: string;
  localeKey: string;
  isDuplicated: boolean;
}) => {
  const { t } = useTranslation('repo');
  const dispatch = useAppDispatch();

  const onSubmit = useCallback(
    (value: string) => {
      if (value === localeKey) return;
      dispatch(handleLocaleKeyOnChange({ value, localeId }));
    },
    [localeKey, localeId]
  );

  return (
    <>
      <Editable
        value={localeKey}
        w="100%"
        onChange={onSubmit}
        isDisabled={isMobile}>
        <EditablePreview
          w="100%"
          overflow="hidden"
          fontWeight="bold"
          noOfLines={2}
        />
        <EditableInput />
      </Editable>

      {isDuplicated && (
        <Tooltip hasArrow label={t('Duplicated key')} background="error">
          <WarningIcon w="4" h="4" color="error" />
        </Tooltip>
      )}
    </>
  );
};

export default memo(TableCell);
