import { Stack, Button, useToast } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import useGetNamespaces from '../hooks/getNamespaces';
import {
  CONFIG_PATH,
  CUSTOM_PATH_HANDLER_PATH,
  RECENT_BRANCHES_SIZE
} from '../../../constants';

import {
  Repo,
  setEditingRepo,
  setInitialRepoData,
  setSaveModalProps
} from '../../../redux/editingRepoSlice';
import { useUpdateExistingRepoMutation } from '../../../redux/services/firestoreApi';
import {
  useCreateBranchMutation,
  useLazyGetBranchQuery,
  useLazyGetContentQuery
} from '../../../redux/services/octokitApi';
import { useAppDispatch } from '../../../redux/store';

import { decodeConfigFile } from '../../../utils/fileHelper';
import { FormValues } from './interface';

import LoadingModal from '../../../component/LoadingModal';
import BranchForm from './BranchForm';
import ConfigForm from './ConfigForm';
import { SETUP_CONFIG_COMMIT_MESSAGE } from '../constants';
import { ERROR_MSG } from '../../../utils/GitApiWrapper/constants';

interface IProps {
  repo: Repo;
}

const BranchFormModal = ({ repo }: IProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('repo');
  const { t: commonT } = useTranslation();
  const toast = useToast();

  const [isNewConfig, setIsNewConfig] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [getBranch, { isLoading: isFetchingBranch }] = useLazyGetBranchQuery();
  const [getContent, { isLoading: isFetchingConfig }] =
    useLazyGetContentQuery();
  const [createBranch, { isLoading: isCreatingRef }] =
    useCreateBranchMutation();
  const [updateExistingRepo, { isLoading: isUpdatingRepo }] =
    useUpdateExistingRepoMutation();
  const [getNamespaces, { isLoading: isFetchingNamespaces }] =
    useGetNamespaces();

  const getLoadingTitle = () => {
    if (isFetchingBranch) return t('Fetching branch');
    if (isFetchingConfig) return t('Fetching config');
    if (isCreatingRef) return t('Creating branch');
    if (isUpdatingRepo) return t('Updating record');
    if (isFetchingNamespaces) return t('Fetching namespaces');
    return undefined;
  };
  const form = useForm<FormValues>({
    defaultValues: { config: { languages: ['en'] }, action: 'existing' }
  });
  const { watch, handleSubmit, setError, setValue, getValues } = form;

  const [languages] = watch(['config.languages']);

  useEffect(() => {
    const defaultLanguage = getValues('config.defaultLanguage');
    if (!languages || (defaultLanguage && languages.includes(defaultLanguage)))
      return;
    setValue('config.defaultLanguage', languages[0]);
  }, [languages, getValues, setValue]);

  const onSubmit = async (values: FormValues & { isRecentBranch: boolean }) => {
    const {
      action,
      baseOn,
      newBranchName,
      existingBranchName,
      isRecentBranch = false,
      config
    } = values;

    try {
      setLoading(true);
      const branch = await getBranch({
        repo: repo.repo,
        owner: repo.owner,
        branch: action === 'create' ? baseOn : existingBranchName
      }).unwrap();

      if (action === 'existing' && branch.isProtected) {
        throw new Error(ERROR_MSG.PROTECTED_BRANCH);
      }

      const repoConfig = isNewConfig
        ? config
        : await getContent({
            repo: repo.repo,
            owner: repo.owner,
            path: CONFIG_PATH,
            branch: branch.name,
            commitHash: branch.commitHash
          })
            .unwrap()
            .then((data) => decodeConfigFile(data))
            .catch(async () => {
              if (isRecentBranch) {
                const updatedRepo = await updateExistingRepo({
                  ...repo,
                  recentBranches: repo.recentBranches?.filter(
                    (branchName) => branchName !== existingBranchName
                  )
                }).unwrap();
                dispatch(setEditingRepo(updatedRepo));
                toast({
                  title: t('Config file not found in this branch'),
                  status: 'error'
                });
              } else {
                setIsNewConfig(true);
              }
              return null;
            });
      if (!repoConfig) return;

      if (action === 'create') {
        await createBranch({
          repo: repo.repo,
          owner: repo.owner,
          branch: newBranchName,
          hash: branch.commitHash
        }).unwrap();
      }
      const branchName =
        action === 'create' ? newBranchName : existingBranchName;
      if (repo.recentBranches?.[0] !== branchName) {
        const updatedRepo = await updateExistingRepo({
          ...repo,
          recentBranches: Array.from(
            new Set([branchName, ...(repo.recentBranches || [])])
          ).slice(0, RECENT_BRANCHES_SIZE)
        }).unwrap();
        dispatch(setEditingRepo(updatedRepo));
      }
      const initRepoData: Parameters<typeof setInitialRepoData>[0] = {
        namespaces: [''],
        languages: repoConfig.languages,
        repoConfig,
        branch: branchName,
        commitHash: branch.commitHash,
        configExist: !isNewConfig
      };

      if (repoConfig.useCustomPath && repoConfig.namespaces !== undefined) {
        initRepoData.namespaces = repoConfig.namespaces;
        initRepoData.customPathHandlerScript = await getContent({
          repo: repo.repo,
          owner: repo.owner,
          branch: branchName,
          path: CUSTOM_PATH_HANDLER_PATH,
          commitHash: branch.commitHash
        }).unwrap();
      } else {
        const namespaces = await getNamespaces({
          repo,
          repoConfig,
          branch: branch.name,
          rootSha: branch.treeHash
        });
        initRepoData.namespaces = namespaces;
      }
      dispatch(setInitialRepoData(initRepoData));
      if (isNewConfig) {
        dispatch(
          setSaveModalProps({
            title: t('Save config'),
            commitMessage: SETUP_CONFIG_COMMIT_MESSAGE,
            description: t('Save config description', {
              path: `<code style='background-color: var(--chakra-colors-text--selected)'>${CONFIG_PATH}</code>`
            })
          })
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      switch (e?.message) {
        case ERROR_MSG.PROTECTED_BRANCH:
          if (isRecentBranch) {
            toast({
              title: t('Protected branch not supported'),
              status: 'error'
            });
            const updatedRepo = await updateExistingRepo({
              ...repo,
              recentBranches: repo.recentBranches?.filter(
                (branchName) => branchName !== existingBranchName
              )
            }).unwrap();
            dispatch(setEditingRepo(updatedRepo));
          } else {
            setError('existingBranchName', {
              message: t('Protected branch not supported')
            });
          }
          break;
        case ERROR_MSG.BRANCH_NOT_FOUND:
          if (isRecentBranch) {
            const updatedRepo = await updateExistingRepo({
              ...repo,
              recentBranches: repo.recentBranches?.filter(
                (branchName) => branchName !== existingBranchName
              )
            }).unwrap();
            dispatch(setEditingRepo(updatedRepo));
            toast({ title: t('Branch not found'), status: 'error' });
          } else {
            setError(action === 'create' ? 'baseOn' : 'existingBranchName', {
              message: t('Branch not found')
            });
          }
          break;
        case ERROR_MSG.BRANCH_ALREADY_EXIST:
          setError('newBranchName', {
            message: t('Branch already exists')
          });
          break;
        case ERROR_MSG.BRANCH_PERMISSION_VIOLATED:
          setError('newBranchName', {
            message: t('Protected branch not supported')
          });
          break;
        default:
          console.log(e);
          toast({ title: commonT('Something went wrong'), status: 'error' });
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const onCancelConfigForm = useCallback(() => {
    setIsNewConfig(false);
  }, []);

  return (
    <FormProvider {...form}>
      <form data-e2e-id="repo_setup" onSubmit={handleSubmit(onSubmit)}>
        <Stack p={5} maxW="50rem" m="0 auto">
          {isNewConfig ? (
            <ConfigForm repo={repo} onCancel={onCancelConfigForm} />
          ) : (
            <BranchForm repo={repo} onSubmit={onSubmit} />
          )}
          <Button isLoading={isLoading} type="submit">
            {commonT('Submit')}
          </Button>
        </Stack>
        {isLoading && <LoadingModal title={getLoadingTitle()} />}
      </form>
    </FormProvider>
  );
};

export default BranchFormModal;
