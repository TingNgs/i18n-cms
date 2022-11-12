import {
  memo,
  forwardRef,
  useMemo,
  useCallback,
  FocusEventHandler
} from 'react';
import { escape } from 'lodash-es';
import { useEditableControls, Flex, Text, FlexProps } from '@chakra-ui/react';
import { useAppSelector } from '../../../../redux/store';

const CellPreview = forwardRef<HTMLDivElement, FlexProps & { value?: string }>(
  function Preview({ value, ...rest }, ref) {
    const matchText = useAppSelector((state) => {
      const { findText } = state.EditingRepoReducer;
      return !!value && value.includes(findText) ? findText : null;
    });

    const html = useMemo(
      () =>
        matchText
          ? escape(value).replace(
              escape(matchText),
              `<mark>${escape(matchText)}</mark>`
            )
          : escape(value),
      [value, matchText]
    );
    const onFocus: FocusEventHandler<HTMLDivElement> = useCallback((e) => {
      e.currentTarget.click();
    }, []);

    const { isEditing, getEditButtonProps } = useEditableControls();
    if (isEditing) return null;
    const buttonProps = getEditButtonProps();
    return (
      <Flex
        w="100%"
        paddingTop="var(--chakra-space-1)"
        paddingBottom="var(--chakra-space-1)"
        position="relative"
        cursor="text"
        {...buttonProps}
        {...rest}
        ref={ref}
        tabIndex={0}
        onFocus={onFocus}>
        <Text
          w="100%"
          overflow="hidden"
          noOfLines={2}
          dangerouslySetInnerHTML={{
            __html: html
          }}
        />
      </Flex>
    );
  }
);

export default memo(CellPreview);
