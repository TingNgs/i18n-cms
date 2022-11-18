import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormLabel,
  Stack,
  Input,
  Button,
  useToast,
  Text
} from '@chakra-ui/react';
import { noop } from 'lodash-es';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { setSaveModalProps } from '../../../redux/editingRepoSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';

import useSaveEditing from '../hooks/useSaveEditing';

const SaveEditingModal = () => {
  const { t } = useTranslation();
  const { t: repoT } = useTranslation('repo');
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { saveEditing, isLoading } = useSaveEditing();
  const { register, handleSubmit, setValue } = useForm<{
    commitMessage: string;
  }>();

  const saveModalProps = useAppSelector(
    (state) => state.EditingRepoReducer.saveModalProps
  );
  useEffect(() => {
    setValue('commitMessage', saveModalProps?.commitMessage || '');
  }, [setValue, saveModalProps?.commitMessage]);

  const onClose = useCallback(() => {
    dispatch(setSaveModalProps(null));
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await saveEditing({
        commitMessage: values.commitMessage || 'Update locale'
      });
    } catch {
      toast({ title: t('Something went wrong'), status: 'error' });
    }
  });

  return (
    <Modal isOpen={!!saveModalProps} onClose={isLoading ? noop : onClose}>
      <ModalOverlay />
      <ModalContent data-e2e-id="save_editing_modal">
        <ModalHeader>{saveModalProps?.title}</ModalHeader>
        {!isLoading && <ModalCloseButton />}
        <ModalBody display="flex" flexDir={{ base: 'column', md: 'row' }}>
          <form onSubmit={onSubmit} style={{ width: '100%' }}>
            <Stack>
              {saveModalProps?.description && (
                <Text
                  __css={{ code: { background: 'red' } }}
                  dangerouslySetInnerHTML={{
                    __html: saveModalProps.description
                  }}
                />
              )}
              <FormLabel>{repoT('Commit message')}</FormLabel>
              <Input
                defaultValue={saveModalProps?.commitMessage || undefined}
                {...register('commitMessage')}
                placeholder="Update locale"
              />
              <Button type="submit" isLoading={isLoading}>
                {t('Submit')}
              </Button>
            </Stack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SaveEditingModal;
