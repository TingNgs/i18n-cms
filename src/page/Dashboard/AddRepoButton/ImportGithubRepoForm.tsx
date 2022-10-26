import { useState } from 'react';
import {
  Button,
  Text,
  Input,
  FormLabel,
  Stack,
  Link,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import gh from 'parse-github-url';
import { useHistory } from 'react-router-dom';

import LoadingModal from '../../../component/LoadingModal';
import { setEditingRepo } from '../../../redux/editingRepoSlice';
import { useAppDispatch } from '../../../redux/store';
import { useUpdateExistingRepoMutation } from '../../../redux/services/firestoreApi';
import useCheckRepoPermissions from './useCheckRepoPermissions';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const CreateNewRepoForm = () => {
  const history = useHistory();
  const { t } = useTranslation('dashboard');
  const dispatch = useAppDispatch();
  const checkRepoPermissions = useCheckRepoPermissions();
  const [updateExistingRepo] = useUpdateExistingRepoMutation();

  const [isLoading, setLoading] = useState(false);

  const { handleSubmit, register, setError, formState } = useForm<{
    githubUrl: string;
  }>();

  const { errors } = formState;

  const onSubmit = handleSubmit(async (values) => {
    const { owner, name } = gh(values.githubUrl) || {};
    if (!owner || !name) {
      setError('githubUrl', { message: t('Invalid github url') });
      return;
    }

    try {
      setLoading(true);

      const result = await checkRepoPermissions({
        repoName: name,
        owner
      });
      if (result.error) {
        setError('githubUrl', { message: result.error });
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
          <Text fontSize="2xl">{t('Import existing Github repository')}</Text>
          <Alert>
            <AlertIcon display={'inline-block'} />
            <Text>
              {t('Setup repo warning')}
              <Link
                href={`${process.env.REACT_APP_DOC_URL}add-repository/existing-repo/#setup-your-existing-repository`}
                isExternal>
                <ExternalLinkIcon _hover={{ color: 'blue.500' }} m={'0 4px'} />
              </Link>
            </Text>
          </Alert>

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
