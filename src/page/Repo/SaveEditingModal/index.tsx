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
  useToast
} from '@chakra-ui/react';
import { noop } from 'lodash-es';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { setSaveModalOpen } from '../../../redux/editingRepoSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import useSaveEditing from '../hooks/useSaveEditing';

const SaveEditingModal = () => {
  const { t } = useTranslation();
  const { t: repoT } = useTranslation('repo');
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { saveEditing, isLoading } = useSaveEditing();
  const { register, handleSubmit } = useForm<{ commitMessage: string }>();

  const isSaveModalOpen = useAppSelector(
    (state) => state.EditingRepoReducer.isSaveModalOpen
  );
  const onClose = useCallback(() => {
    dispatch(setSaveModalOpen(false));
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
    <Modal isOpen={isSaveModalOpen} onClose={isLoading ? noop : onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader></ModalHeader>
        {!isLoading && <ModalCloseButton />}
        <ModalBody display="flex" flexDir={{ base: 'column', md: 'row' }}>
          <form onSubmit={onSubmit} style={{ width: '100%' }}>
            <Stack>
              <FormLabel>{repoT('Commit message')}</FormLabel>
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
