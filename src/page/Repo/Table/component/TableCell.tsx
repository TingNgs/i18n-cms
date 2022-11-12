import { memo, useCallback, useEffect, useRef } from 'react';
import { Editable, EditableTextarea, Flex } from '@chakra-ui/react';

import { get } from 'lodash-es';

import { CELL_PROPS } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { handleLocaleOnChange } from '../../../../redux/editingRepoSlice';
import CellPreview from './CellPreview';

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
  const previewRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const value = useAppSelector((state) => {
    const localesData =
      state.EditingRepoReducer.modifiedLocalesData[
        state.EditingRepoReducer.selectedNamespace || ''
      ];
    return get(localesData, [localeId, 'value', language], '');
  });

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
      <Editable w="100%" onChange={onChange} value={value}>
        <CellPreview
          ref={previewRef}
          value={value}
          minH={`${TEXTAREA_MIN_HEIGHT}px`}
        />
        <EditableTextarea ref={textareaRef} />
      </Editable>
    </Flex>
  );
};

export default memo(TableCell);
