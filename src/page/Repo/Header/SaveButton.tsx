import { memo, useCallback, useEffect } from 'react';
import { Button } from '@chakra-ui/react';
import { Prompt } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../../redux/store';

import { isDataChangedSelector } from '../hooks/useSaveEditing';

import { setSaveModalOpen } from '../../../redux/editingRepoSlice';
import { useTranslation } from 'react-i18next';

const SaveButton = () => {
  const { t } = useTranslation();
  const { t: repoT } = useTranslation('repo');

  const dispatch = useAppDispatch();
  const isDataChanged = useAppSelector(isDataChangedSelector);

  const openSaveModal = useCallback(() => {
    dispatch(setSaveModalOpen(true));
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = repoT(
        'Changes you made may not be saved. Ary you sure you want to leave ?'
      );
      return e;
    };
    if (isDataChanged) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDataChanged]);

  return (
    <>
      <Button disabled={!isDataChanged} onClick={openSaveModal}>
        {t('Save')}
      </Button>
      <Prompt
        when={isDataChanged}
        message={repoT(
          'Changes you made may not be saved. Ary you sure you want to leave ?'
        )}
      />
      ;
    </>
  );
};

export default memo(SaveButton);
