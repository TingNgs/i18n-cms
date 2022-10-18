import React, { useCallback } from 'react';
import {
  Button,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea,
  useBoolean
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useAppDispatch,
  useAppSelector,
  useAppStore
} from '../../../../../redux/store';
import { setLocaleDataById } from '../../../../../redux/editingRepoSlice';

interface IProps {
  localeId?: string;
}

const EditModalBtn = ({ localeId }: IProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { t: repoT } = useTranslation('repo');
  const [isOpen, setOpen] = useBoolean();

  const { getState } = useAppStore();
  const languages = useAppSelector(
    (state) => state.EditingRepoReducer.languages
  );

  const localeData = useAppSelector(
    (state) =>
      state.EditingRepoReducer.modifiedLocalesData[
        state.EditingRepoReducer.selectedNamespace || ''
      ][localeId || '']
  );

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    setError,
    formState: { errors }
  } = useForm<{ key: string; value: { [language: string]: string } }>();

  const onSubmit = handleSubmit((data) => {
    if (!localeId) return null;
    const {
      localeIds,
      modifiedLocalesData,
      selectedNamespace: namespace
    } = getState().EditingRepoReducer;
    if (!namespace) return;

    for (const id of localeIds[namespace]) {
      if (id === localeId) continue;
      if (modifiedLocalesData[namespace][id].key === data.key) {
        setError('key', { message: repoT('Duplicated key') });
        setFocus('key');
        return;
      }
    }
    dispatch(setLocaleDataById({ localeId, data, namespace }));
    setOpen.off();
  });

  const onOpenClick = useCallback(() => {
    setOpen.on();
    reset();
  }, [setOpen.on, reset]);

  return (
    <>
      <Button onClick={onOpenClick}>{t('Edit')}</Button>
      <Modal isOpen={isOpen} onClose={setOpen.off}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader></ModalHeader>
          <ModalBody>
            {isOpen && (
              <form onSubmit={onSubmit}>
                <Stack>
                  <FormLabel>Key</FormLabel>
                  <Input
                    defaultValue={localeData.key}
                    {...register('key')}
                    isRequired
                    borderColor={errors.key ? 'red.500' : undefined}
                    focusBorderColor={errors.key ? 'red.500' : undefined}
                  />
                  {!!errors.key && (
                    <Text color="red.500">{errors.key.message}</Text>
                  )}
                  {languages.map((language) => (
                    <React.Fragment key={language}>
                      <FormLabel>{language}</FormLabel>
                      <Textarea
                        defaultValue={localeData.value[language] || ''}
                        {...register(`value.${language}`)}
                      />
                    </React.Fragment>
                  ))}
                  <Button type="submit">{t('Submit')}</Button>
                </Stack>
              </form>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditModalBtn;
