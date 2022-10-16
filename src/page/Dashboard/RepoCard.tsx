import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Text, useToast } from '@chakra-ui/react';
import { isEqual } from 'lodash-es';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import useCheckRepoPermissions from './AddRepoButton/useCheckRepoPermissions';
import { Repo, setEditingRepo } from '../../redux/editingRepoSlice';
import {
  useUpdateExistingRepoMutation,
  useRemoveExistingRepoMutation
} from '../../redux/services/firestoreApi';
import LoadingModal from '../../component/LoadingModal';

interface IProps {
  repo: Repo;
  refetch: () => void;
}

const RepoCard = ({ repo, refetch }: IProps) => {
  const { t } = useTranslation('dashboard');
  const dispatch = useDispatch();
  const history = useHistory();
  const toast = useToast();
  const [isLoading, setLoading] = useState(false);

  const checkRepoPermissions = useCheckRepoPermissions();
  const [removeExistingRepo] = useRemoveExistingRepoMutation();
  const [updateExistingRepo] = useUpdateExistingRepoMutation();

  const onRepoClick = useCallback(async () => {
    try {
      setLoading(true);
      const result = await checkRepoPermissions({
        repoName: repo.repo,
        owner: repo.owner
      });
      if (result.error) {
        await removeExistingRepo(repo);
        refetch();
        toast({ title: t('Please import repo again'), status: 'error' });
      } else if (result.data) {
        const { repo: validRepo } = result.data;
        const updatedRepo = { ...repo, ...validRepo };
        if (!isEqual(validRepo, repo)) {
          await removeExistingRepo(repo);
          await updateExistingRepo(updatedRepo);
        }
        await dispatch(setEditingRepo(updatedRepo));
        history.push('/repo');
      }
    } finally {
      setLoading(false);
    }
  }, [repo]);

  return (
    <Flex
      key={repo.fullName}
      onClick={onRepoClick}
      cursor="pointer"
      borderWidth={1}
      p="4">
      <Text color="blue.500">{repo.fullName}</Text>
      {isLoading && <LoadingModal title={t('Fetching repo')} />}
    </Flex>
  );
};

export default RepoCard;
