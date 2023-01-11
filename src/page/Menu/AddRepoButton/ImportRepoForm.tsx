import { useState } from 'react';
import {
  Button,
  Text,
  Input,
  FormLabel,
  Stack,
  FormControl,
  FormErrorMessage
} from '@chakra-ui/react';
import { ErrorMessage } from '@hookform/error-message';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import gh from 'parse-github-url';
import parseBitbucketUrl from 'parse-bitbucket-url';
import { useHistory } from 'react-router-dom';

import LoadingModal from '../../../component/LoadingModal';
import { setEditingRepo } from '../../../redux/editingRepoSlice';
import { useAppDispatch } from '../../../redux/store';
import { useUpdateExistingRepoMutation } from '../../../redux/services/firestoreApi';
import useCheckRepoPermissions from './useCheckRepoPermissions';
import { getSessionStorage } from '../../../utils/storage';
import GitApiWrapper from '../../../utils/GitApiWrapper';

const parseGitlabUrl = (gitlabUrl: string) => {
  try {
    const url = new URL(gitlabUrl);

    const path = url.pathname;
    const parts = path.split('/');
    parts.shift();
    if (url.host !== 'gitlab.com') return {};
    const name = parts.pop();
    const owner = parts.join('/');
    return { name, owner };
  } catch {
    return {};
  }
};

const parseGitUrl: (
  url: string,
  gitProvider: keyof typeof GitApiWrapper
) => { name: string; owner: string } | null = (url: string, gitProvider) => {
  switch (gitProvider) {
    case 'bitbucket':
      return parseBitbucketUrl(url);
    case 'github': {
      const { name, owner } = gh(url) || {};
      return name && owner ? { name, owner } : null;
    }
    case 'gitlab': {
      const { name, owner } = parseGitlabUrl(url) || {};
      return name && owner ? { name, owner } : null;
    }
    default:
      return null;
  }
};

const URL_PLACEHOLDER = {
  github: 'https://github.com/owner/repo-name',
  bitbucket: 'https://bitbucket.org/owner/repo-name',
  gitlab: 'https://gitlab.com/owner/repo-name'
};

const ImportRepoForm = () => {
  const history = useHistory();
  const { t } = useTranslation('menu');

  const dispatch = useAppDispatch();
  const checkRepoPermissions = useCheckRepoPermissions();
  const [updateExistingRepo] = useUpdateExistingRepoMutation();

  const [isLoading, setLoading] = useState(false);

  const { handleSubmit, register, setError, formState } = useForm<{
    gitUrl: string;
  }>();

  const { errors } = formState;

  const onSubmit = handleSubmit(async (values) => {
    const { owner, name } =
      parseGitUrl(
        values.gitUrl,
        getSessionStorage('git_provider') || 'github'
      ) || {};
    if (!owner || !name) {
      setError('gitUrl', { message: t('Invalid url') });
      return;
    }

    try {
      setLoading(true);

      const result = await checkRepoPermissions({
        repoName: name,
        owner
      });
      if (result.error) {
        setError('gitUrl', { message: result.error });
      } else if (result.data) {
        const { repo } = result.data;
        await updateExistingRepo({ ...repo, recentBranches: [] });
        await dispatch(
          setEditingRepo({ ...result.data.repo, recentBranches: [] })
        );
        history.push('/repo');
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <>
      <form onSubmit={onSubmit} style={{ width: '100%' }}>
        <Stack w="100%">
          <Text fontSize="2xl">{t('Import existing repository')}</Text>
          <FormControl isRequired isInvalid={!!errors.gitUrl}>
            <FormLabel>{t('Repository url')}</FormLabel>
            <Input
              {...register('gitUrl')}
              placeholder={
                URL_PLACEHOLDER[getSessionStorage('git_provider') || 'github']
              }
            />
            <ErrorMessage errors={errors} name="gitUrl" as={FormErrorMessage} />
          </FormControl>

          <Button type="submit">{t('Import')}</Button>
        </Stack>
      </form>
      {isLoading && <LoadingModal />}
    </>
  );
};

export default ImportRepoForm;
