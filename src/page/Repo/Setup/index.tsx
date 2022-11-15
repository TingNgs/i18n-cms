import { Stack, Button, useToast } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import useGetNamespaces from '../hooks/getNamespaces';
import useGetCustomPathHandler from '../hooks/useGetCustomPathHandler';
import { CONFIG_PATH, RECENT_BRANCHES_SIZE } from '../../../constants';

import {
  Repo,
  setEditingRepo,
  setInitialRepoData,
  setSaveModalProps
} from '../../../redux/editingRepoSlice';
import { useUpdateExistingRepoMutation } from '../../../redux/services/firestoreApi';
import {
  useCreateGithubRefMutation,
  useLazyGetGithubBranchQuery,
  useLazyGetGithubContentQuery
} from '../../../redux/services/octokitApi';
import { useAppDispatch } from '../../../redux/store';

import { decodeConfigFile } from '../../../utils/fileHelper';
import { FormValues } from './interface';

import LoadingModal from '../../../component/LoadingModal';
import BranchForm from './BranchForm';
import ConfigForm from './ConfigForm';

interface IProps {
  repo: Repo;
}

const BranchFormModal = ({ repo }: IProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('repo');
  const { t: commonT } = useTranslation();
  const toast = useToast();

  const [showConfigForm, setShowConfigForm] = useState(false);
  const [isNewConfig, setIsNewConfig] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [getGithubBranch, { isLoading: isFetchingBranch }] =
    useLazyGetGithubBranchQuery();
  const [getGithubContent, { isLoading: isFetchingConfig }] =
    useLazyGetGithubContentQuery();
  const [createGithubRef, { isLoading: isCreatingRef }] =
    useCreateGithubRefMutation();
  const [updateExistingRepo, { isLoading: isUpdatingRepo }] =
    useUpdateExistingRepoMutation();
  const [getNamespaces, { isLoading: isFetchingNamespaces }] =
    useGetNamespaces();
  const [getCustomPathHandler, { isLoading: isFetchingCustomPathHandler }] =
    useGetCustomPathHandler();

  const getLoadingTitle = () => {
    if (isFetchingBranch) return t('Fetching branch');
    if (isFetchingConfig) return t('Fetching config');
    if (isCreatingRef) return t('Creating branch');
    if (isUpdatingRepo) return t('Updating record');
    if (isFetchingNamespaces || isFetchingCustomPathHandler)
      return t('Fetching namespaces');
    return undefined;
  };
  const form = useForm<FormValues>({
    defaultValues: { config: { languages: ['en'] } }
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
      const branch = await getGithubBranch({
        repo: repo.repo,
        owner: repo.owner,
        branch: action === 'create' ? baseOn : existingBranchName
      }).unwrap();

      if (action === 'existing' && branch.protection.enabled) {
        throw new Error('Protected branch');
      }

      const repoConfig = isNewConfig
        ? config
        : await getGithubContent({
            repo: repo.repo,
            owner: repo.owner,
            path: CONFIG_PATH,
            ref: branch.name
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
                setShowConfigForm(true);
                setIsNewConfig(true);
              }
              return null;
            });
      if (!repoConfig) return;

      if (action === 'create') {
        await createGithubRef({
          repo: repo.repo,
          owner: repo.owner,
          ref: `refs/heads/${newBranchName}`,
          sha: branch.commit.sha
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
      const initRepoData = {
        namespaces: [''],
        languages: repoConfig.languages,
        repoConfig,
        branch: branchName
      };

      if (repoConfig.useCustomPath && repoConfig.namespaces !== undefined) {
        initRepoData.namespaces = repoConfig.namespaces;
        await getCustomPathHandler({ repo, branch: branchName });
      } else {
        const namespaces = await getNamespaces({
          repo,
          repoConfig,
          rootSha: branch.commit.commit.tree.sha
        });
        initRepoData.namespaces = namespaces;
      }
      dispatch(setInitialRepoData(initRepoData));
      if (isNewConfig) {
        dispatch(
          setSaveModalProps({
            title: t('Save config'),
            commitMessage: 'Setup i18n-cms config',
            description: t('Save config description', {
              path: `<code style='background-color: var(--chakra-colors-text--selected)'>${CONFIG_PATH}</code>`
            })
          })
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      switch (e?.message) {
        case 'Protected branch':
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
        case 'Branch not found':
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
        case 'Reference already exists':
          setError('newBranchName', {
            message: t('Branch already exists')
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
    setShowConfigForm(false);
  }, []);

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack p={5} maxW="50rem" m="0 auto">
          <BranchForm
            repo={repo}
            onSubmit={onSubmit}
            showConfigForm={showConfigForm}
          />
          {isNewConfig && (
            <ConfigForm
              repo={repo}
              showConfigForm={showConfigForm}
              onCancel={onCancelConfigForm}
            />
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
