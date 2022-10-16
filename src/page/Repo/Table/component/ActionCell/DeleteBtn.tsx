import { DeleteIcon } from '@chakra-ui/icons';
import { IconButton, Text, useDisclosure } from '@chakra-ui/react';
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
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { t: repoT } = useTranslation('repo');

  const onDeleteBtnClicked = useCallback(() => {
    if (index === undefined) return;
    onClose();
    dispatch(removeLocaleOnIndex({ index }));
  }, [index]);

  return (
    <PopoverDeleteBtn
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
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
      <IconButton aria-label="more" icon={<DeleteIcon />} colorScheme="gray" />
    </PopoverDeleteBtn>
  );
};

export default memo(DeleteBtn);
