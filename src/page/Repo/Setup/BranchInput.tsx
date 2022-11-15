import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormLabel, Text, Input } from '@chakra-ui/react';

import { FormValues } from './interface';

const BranchInput = ({ showConfigForm }: { showConfigForm: boolean }) => {
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
      <FormLabel>{t('Base on')}</FormLabel>
      <Input
        {...register('baseOn')}
        placeholder="master"
        borderColor={errors.baseOn ? 'error' : undefined}
        focusBorderColor={errors.baseOn ? 'error' : undefined}
        disabled={showConfigForm}
        required
      />
      {errors.baseOn && <Text color="error">{errors.baseOn.message}</Text>}
      <FormLabel>{t('New branch name')}</FormLabel>
      <Input
        {...register('newBranchName')}
        placeholder="feature/add-xxx-locales"
        borderColor={errors.newBranchName ? 'error' : undefined}
        focusBorderColor={errors.newBranchName ? 'error' : undefined}
        required
      />
      {errors.newBranchName && (
        <Text color="error">{errors.newBranchName.message}</Text>
      )}
    </>
  ) : (
    <>
      <FormLabel>{t('Existing branch name')}</FormLabel>
      <Input
        {...register('existingBranchName')}
        placeholder="feature/add-xxx-locales"
        borderColor={errors.existingBranchName ? 'error' : undefined}
        focusBorderColor={errors.existingBranchName ? 'error' : undefined}
        disabled={showConfigForm}
        required
      />
      {errors.existingBranchName && (
        <Text color="error">{errors.existingBranchName.message}</Text>
      )}
    </>
  );
};

export default BranchInput;
