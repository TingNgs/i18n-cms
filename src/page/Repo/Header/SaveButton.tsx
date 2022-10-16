import { memo, useCallback } from 'react';

import { Button } from '@chakra-ui/react';

import { useAppDispatch, useAppSelector } from '../../../redux/store';

import { isDataChangedSelector } from '../hooks/useSaveEditing';

import { setSaveModalOpen } from '../../../redux/editingRepoSlice';
import { useTranslation } from 'react-i18next';

const SaveButton = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const isDataChanged = useAppSelector(isDataChangedSelector);

  const openSaveModal = useCallback(() => {
    dispatch(setSaveModalOpen(true));
  }, []);

  return (
    <Button disabled={!isDataChanged} onClick={openSaveModal}>
      {t('Save')}
    </Button>
  );
};

export default memo(SaveButton);
