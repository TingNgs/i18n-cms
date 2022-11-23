import { memo, useCallback } from 'react';
import { Editable, EditableInput, Tooltip, Flex } from '@chakra-ui/react';
import { WarningIcon, DragHandleIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import { type DraggableProvided } from 'react-beautiful-dnd';

import { useAppDispatch } from '../../../../redux/store';
import { handleLocaleKeyOnChange } from '../../../../redux/editingRepoSlice';

import CellPreview from './CellPreview';
import { CELL_PROPS } from '../../constants';

const KeyCell = ({
  isMobile,
  localeId,
  localeKey,
  isDuplicated,
  provided
}: {
  isMobile: boolean;
  localeId: string;
  localeKey: string;
  isDuplicated: boolean;
  provided: DraggableProvided;
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
    <Flex
      data-e2e-id="table_key_cell"
      {...CELL_PROPS}
      {...(isMobile ? { minWidth: undefined } : {})}
      position="sticky"
      left="0"
      zIndex={1}
      gap={1}>
      <Flex {...provided.dragHandleProps} marginRight="2">
        <DragHandleIcon w="3" h="3" />
      </Flex>

      <Editable
        w="100%"
        onChange={onSubmit}
        isDisabled={isMobile}
        value={localeKey}>
        <CellPreview value={localeKey} fontWeight="bold" />
        <EditableInput />
      </Editable>

      {isDuplicated && (
        <Tooltip hasArrow label={t('Duplicated key')} background="error">
          <WarningIcon w="4" h="4" color="error" />
        </Tooltip>
      )}
    </Flex>
  );
};

export default memo(KeyCell);
