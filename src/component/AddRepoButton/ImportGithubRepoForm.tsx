import { useState } from 'react';
import { Button, Text, Input, FormLabel, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import gh from 'parse-github-url';
import { useNavigate } from 'react-router-dom';

import {
  useLazyGetGithubRepoQuery,
  useLazyGetGithubContentQuery
} from '../../redux/services/octokitApi';
import { CONFIG_PATH } from '../../constants';
import { decodeConfigFile } from '../../utils/fileHelper';
import LoadingModal from '../LoadingModel';
import {
  setEditingRepoConfig,
  setEditingRepo
} from '../../redux/editingRepoSlice';
import { useAppDispatch } from '../../redux/store';
import { useAddExistingRepoMutation } from '../../redux/services/firestoreApi';

const CreateNewRepoForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [getGithubRepo] = useLazyGetGithubRepoQuery();
  const [getGithubContent] = useLazyGetGithubContentQuery();
  const [addExistingRepo] = useAddExistingRepoMutation();

  const [isLoading, setLoading] = useState(false);

  const { handleSubmit, register, setError, formState } = useForm<{
    githubUrl: string;
  }>();

  const { errors } = formState;

  const onSubmit = handleSubmit(async (values) => {
    try {
      setLoading(true);
      const { owner, name } = gh(values.githubUrl) || {};
      if (!owner || !name) {
        setError('githubUrl', { message: t('Invalid github url') });
        return;
      }
      const repo = await getGithubRepo({ repo: name, owner }).unwrap();
      if (!repo.permissions?.push) {
        setError('githubUrl', {
          message: t('Without push permission in this repo')
        });
      }

      const configFile = await getGithubContent({
        repo: name,
        owner,
        path: CONFIG_PATH
      }).unwrap();
      const config = decodeConfigFile(configFile);
      if (!config) {
        setError('githubUrl', { message: t('Config file error') });
        throw new Error('Config file error');
      }
      await addExistingRepo({ repo: name, owner, fullName: repo.full_name });
      await dispatch(setEditingRepoConfig(config));
      await dispatch(
        setEditingRepo({
          owner: repo.owner.login,
          repo: repo.name,
          fullName: repo.full_name
        })
      );
      navigate('/repo');
    } finally {
      setLoading(false);
    }
  });

  return (
    <>
      <form onSubmit={onSubmit} style={{ width: '100%' }}>
        <Stack w="100%">
          <Text fontSize="2xl">{t('Import existing i18n repository')}</Text>

          <FormLabel>{t('Github repository url')}</FormLabel>
          <Input
            {...register('githubUrl')}
            placeholder="https://github.com/owner/repo-name"
            required
            borderColor={errors.githubUrl?.message ? 'red.500' : undefined}
            focusBorderColor={errors.githubUrl?.message ? 'red.500' : undefined}
          />
          {errors.githubUrl?.message && (
            <Text color="red.500">{errors.githubUrl?.message}</Text>
          )}

          <Button type="submit">{t('Import')}</Button>
        </Stack>
      </form>
      {isLoading && <LoadingModal />}
    </>
  );
};

export default CreateNewRepoForm;
