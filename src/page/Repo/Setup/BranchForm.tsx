import {
  Stack,
  Text,
  RadioGroup,
  Radio,
  Divider,
  Flex,
  Alert,
  AlertIcon,
  Link
} from '@chakra-ui/react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ExternalLinkIcon } from '@chakra-ui/icons';

import { Repo } from '../../../redux/editingRepoSlice';

import { getGithubUrl } from '../../../utils';
import { FormValues } from './interface';
import BranchInput from './BranchInput';

interface IProps {
  repo: Repo;
  onSubmit: (values: FormValues & { isRecentBranch: boolean }) => void;
}

const BranchForm = ({ repo, onSubmit }: IProps) => {
  const { t } = useTranslation('repo');
  const { t: commonT } = useTranslation();

  const { register, control } = useFormContext<FormValues>();

  const action = useWatch({ control, name: 'action' });

  return (
    <Stack>
      <Text fontSize="2xl" fontWeight="semibold">
        {t('Choose branch')}
      </Text>
      <Alert>
        <AlertIcon />
        <Text>{t('Branch alert')}</Text>
      </Alert>
      <Text fontWeight="semibold">{commonT('Repository')}</Text>
      <Link isExternal href={getGithubUrl(repo)}>
        <ExternalLinkIcon marginBottom={1} /> {repo?.fullName}
      </Link>
      <Divider />
      {repo.recentBranches?.length && (
        <>
          <Text fontWeight="semibold">{t('Recent branches')}</Text>
          {repo.recentBranches?.map((branchName) => (
            <Flex
              data-e2e-id="recent_branch"
              key={branchName}
              cursor="pointer"
              onClick={() => {
                onSubmit({
                  action: 'existing',
                  baseOn: '',
                  newBranchName: '',
                  existingBranchName: branchName,
                  isRecentBranch: true
                });
              }}
              opacity={0.7}
              _hover={{ opacity: 1 }}>
              <Text>{branchName}</Text>
            </Flex>
          ))}
          <Divider />
        </>
      )}
      <RadioGroup defaultValue={action}>
        <Stack>
          <Radio
            {...register('action')}
            data-e2e-id="branch_action_existing"
            value="existing">
            {t('Use existing branch')}
          </Radio>
          <Radio
            {...register('action')}
            data-e2e-id="branch_action_create"
            value="create">
            {t('Create new branch')}
          </Radio>
        </Stack>
      </RadioGroup>
      <Divider />
      <BranchInput />
    </Stack>
  );
};

export default BranchForm;
