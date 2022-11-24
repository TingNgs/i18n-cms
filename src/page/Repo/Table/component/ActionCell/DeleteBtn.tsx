import { DeleteIcon } from '@chakra-ui/icons';
import { IconButton, Text } from '@chakra-ui/react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import PopoverDeleteBtn from '../../../../../component/PopoverDeleteBtn';

import { removeLocaleOnIndex } from '../../../../../redux/editingRepoSlice';
import { useAppDispatch } from '../../../../../redux/store';

const DeleteBtn = ({
  localeKey,
  index
}: {
  localeId?: string;
  localeKey?: string;
  index?: number;
}) => {
  const dispatch = useAppDispatch();

  const { t: repoT } = useTranslation('repo');

  const onDeleteBtnClicked = useCallback(() => {
    if (index === undefined) return;
    dispatch(removeLocaleOnIndex({ index }));
  }, [index]);

  return (
    <PopoverDeleteBtn
      title={
        <Text
          dangerouslySetInnerHTML={{
            __html: repoT('Delete key', {
              localeKey
            })
          }}
        />
      }
      content={
        <Text
          dangerouslySetInnerHTML={{
            __html: repoT('Delete key confirmation', {
              localeKey
            })
          }}
        />
      }
      onConfirm={onDeleteBtnClicked}>
      <IconButton
        aria-label="delete locale"
        icon={<DeleteIcon color="error" />}
        variant="outline"
      />
    </PopoverDeleteBtn>
  );
};

export default memo(DeleteBtn);
