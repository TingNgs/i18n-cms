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
  Button
} from '@chakra-ui/react';
import { noop } from 'lodash-es';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { setSaveModalOpen } from '../../../redux/editingRepoSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import useSaveEditing from './useSaveEditing';

const SaveEditingModal = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { saveEditing, isLoading } = useSaveEditing();
  const { register, handleSubmit } = useForm<{ commitMessage: string }>();

  const isSaveModalOpen = useAppSelector(
    (state) => state.EditingRepoReducer.isSaveModalOpen
  );
  const onClose = useCallback(() => {
    dispatch(setSaveModalOpen(false));
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    console.log(values);
    await saveEditing({
      commitMessage: values.commitMessage || 'Update locale'
    });
  });

  return (
    <Modal isOpen={isSaveModalOpen} onClose={isLoading ? noop : onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader></ModalHeader>
        {!isLoading && <ModalCloseButton />}
        <ModalBody display="flex" flexDir={{ base: 'column', md: 'row' }}>
          <form onSubmit={onSubmit} style={{ width: '100%' }}>
            <Stack>
              <FormLabel>{t('Commit message')}</FormLabel>
              <Input
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
