import { memo, useCallback } from 'react';
import { Editable, EditableInput, EditablePreview } from '@chakra-ui/react';

import { Cell } from './View';
import { useAppDispatch } from '../../../redux/store';
import { handleLocaleKeyOnChange } from '../../../redux/editingRepoSlice';

const TableCell = ({
  index,
  localeKey
}: {
  index: number;
  localeKey: string;
}) => {
  const dispatch = useAppDispatch();

  const onSubmit = useCallback(
    (value: string) => {
      dispatch(handleLocaleKeyOnChange({ value, localeKey, index }));
    },
    [localeKey, index]
  );

  return (
    <Cell position="sticky" left="0" zIndex={1}>
      <Editable defaultValue={localeKey} w="100%" onChange={onSubmit}>
        <EditablePreview
          w="100%"
          overflow="hidden"
          fontWeight="bold"
          noOfLines={2}
        />
        <EditableInput />
      </Editable>
    </Cell>
  );
};

export default memo(TableCell);
