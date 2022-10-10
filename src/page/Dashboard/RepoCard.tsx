import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Text, useToast } from '@chakra-ui/react';
import { isEqual } from 'lodash-es';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import useCheckRepoPermissions from '../../hooks/useCheckRepoPermissions';
import { Repo, setEditingRepo } from '../../redux/editingRepoSlice';
import {
  useUpdateExistingRepoMutation,
  useRemoveExistingRepoMutation
} from '../../redux/services/firestoreApi';
import LoadingModal from '../../component/LoadingModal';

interface IProps {
  repo: Repo;
}

const RepoCard = ({ repo }: IProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
        toast({ title: result.error, status: 'error' });
        toast({ title: t('Please import repo again'), status: 'error' });
      } else if (result.data) {
        const { repo: validRepo } = result.data;
        const updatedRepo = { ...repo, ...validRepo };
        if (!isEqual(validRepo, repo)) {
          await removeExistingRepo(repo);
          await updateExistingRepo(updatedRepo);
        }
        await dispatch(setEditingRepo(updatedRepo));
        navigate('/repo');
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
      {isLoading && <LoadingModal />}
    </Flex>
  );
};

export default RepoCard;
