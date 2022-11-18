import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  FormLabel,
  Input,
  FormControl,
  FormErrorMessage
} from '@chakra-ui/react';
import { ErrorMessage } from '@hookform/error-message';

import { FormValues } from './interface';

const BranchInput = ({ isConfigForm }: { isConfigForm?: boolean }) => {
  const { t } = useTranslation('repo');

  const {
    register,
    watch,
    formState: { errors },
    setValue,
    getValues
  } = useFormContext<FormValues>();

  const [action, languages] = watch(['action', 'config.languages']);

  useEffect(() => {
    const defaultLanguage = getValues('config.defaultLanguage');
    if (!languages || (defaultLanguage && languages.includes(defaultLanguage)))
      return;
    setValue('config.defaultLanguage', languages[0]);
  }, [languages, getValues, setValue]);

  return action === 'create' ? (
    <>
      <FormControl isRequired isInvalid={!!errors.baseOn}>
        <FormLabel>{t('Base on')}</FormLabel>
        <Input
          {...register('baseOn')}
          placeholder="master"
          disabled={isConfigForm}
        />
        <ErrorMessage errors={errors} name="baseOn" as={FormErrorMessage} />
      </FormControl>
      <FormControl isRequired isInvalid={!!errors.newBranchName}>
        <FormLabel>{t('New branch name')}</FormLabel>
        <Input
          {...register('newBranchName')}
          placeholder="feature/add-xxx-locales"
        />
        <ErrorMessage
          errors={errors}
          name="newBranchName"
          as={FormErrorMessage}
        />
      </FormControl>
    </>
  ) : (
    <FormControl isRequired isInvalid={!!errors.existingBranchName}>
      <FormLabel>{t('Existing branch name')}</FormLabel>
      <Input
        {...register('existingBranchName')}
        placeholder="feature/add-xxx-locales"
        disabled={isConfigForm}
      />
      <ErrorMessage
        errors={errors}
        name="existingBranchName"
        as={FormErrorMessage}
      />
    </FormControl>
  );
};

export default BranchInput;
