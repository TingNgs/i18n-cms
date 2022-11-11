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
import {
  RepoConfig,
  setLocaleDataById
} from '../../../../../redux/editingRepoSlice';
import { flatten, unflatten } from 'flat';
import { includes } from 'lodash-es';
import { FLATTEN_LOCALES_FILE_TYPE } from '../../../../../constants';

interface IProps {
  localeId?: string;
}

const isDuplicatedKey = (
  key1: string,
  key2: string,
  fileType: RepoConfig['fileType']
) =>
  Object.keys(
    includes(FLATTEN_LOCALES_FILE_TYPE, fileType)
      ? { [key1]: true, [key2]: true }
      : flatten(unflatten({ [key1]: true, [key2]: true }))
  ).length !== 2;

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
    const {
      localeIds,
      modifiedLocalesData,
      selectedNamespace: namespace,
      editingRepoConfig
    } = getState().EditingRepoReducer;
    if (!namespace || !localeId || !editingRepoConfig) return;

    for (const id of localeIds[namespace]) {
      if (id === localeId) continue;
      if (
        isDuplicatedKey(
          modifiedLocalesData[namespace][id].key,
          data.key,
          editingRepoConfig.fileType
        )
      ) {
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
                    borderColor={errors.key ? 'error' : undefined}
                    focusBorderColor={errors.key ? 'error' : undefined}
                  />
                  {!!errors.key && (
                    <Text color="error">{errors.key.message}</Text>
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
