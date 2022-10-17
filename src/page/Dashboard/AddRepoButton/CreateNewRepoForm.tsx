import { useCallback, useState } from 'react';
import {
  Button,
  Text,
  Input,
  FormLabel,
  Stack,
  HStack,
  Radio,
  RadioGroup,
  useToast,
  Select
} from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import {
  LOCALES_FILE_STRUCTURE,
  LOCALES_FILE_TYPE,
  REPOSITORY_VISIBILITY
} from '../../../constants';
import {
  useCreateGithubRepoMutation,
  useCommitGithubFilesMutation
} from '../../../redux/services/octokitApi';

import TagInput from '../../../component/TagInput';
import { dataToFiles } from '../../../utils/fileHelper';
import OwnerSelect, { Owner } from '../../../component/OwnerSelect';
import LoadingModal from '../../../component/LoadingModal';
import { setEditingRepo } from '../../../redux/editingRepoSlice';
import { useAppDispatch } from '../../../redux/store';
import { useUpdateExistingRepoMutation } from '../../../redux/services/firestoreApi';

const CreateNewRepoForm = () => {
  const history = useHistory();
  const toast = useToast();
  const { t: dashboardT } = useTranslation('dashboard');
  const { t: commonT } = useTranslation('common');
  const dispatch = useAppDispatch();
  const [isLoading, setLoading] = useState(false);

  const [createGithubRepo, { isLoading: isCreateRepoLoading }] =
    useCreateGithubRepoMutation();
  const [commitGithubFiles, { isLoading: isCommitLoading }] =
    useCommitGithubFilesMutation();
  const [updateExistingRepo] = useUpdateExistingRepoMutation();

  const { handleSubmit, register, control, watch } = useForm<{
    owner: Owner;
    name: string;
    basePath: string;
    fileStructure: typeof LOCALES_FILE_STRUCTURE[number];
    fileType: typeof LOCALES_FILE_TYPE[number];
    visibility: typeof REPOSITORY_VISIBILITY[number];
    languages: string[];
    namespaces: string[];
    defaultLanguage: string;
  }>();

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { name, visibility, languages, namespaces, ...repoConfig } = values;
      setLoading(true);
      const repo = await createGithubRepo({
        name,
        visibility,
        owner
      })
        .unwrap()
        .catch((e) => {
          toast({ title: dashboardT('Create new repo fail'), status: 'error' });
          throw e;
        });

      await commitGithubFiles({
        owner: repo.owner.login,
        repo: repo.name,
        branch: repo.default_branch,
        change: {
          message: 'Initial locales',
          files: dataToFiles({
            languages,
            namespaces,
            repoConfig
          })
        }
      }).catch((e) => {
        toast({ title: dashboardT('Setup new repo fail'), status: 'error' });
        throw e;
      });
      await updateExistingRepo({
        repo: repo.name,
        owner: repo.owner.login,
        fullName: repo.full_name,
        recentBranches: []
      });

      dispatch(
        setEditingRepo({
          owner: repo.owner.login,
          repo: repo.name,
          fullName: repo.full_name,
          recentBranches: []
        })
      );
      history.push('/repo');
    } finally {
      setLoading(false);
    }
  });

  const [owner, basePath, languages, fileType] = watch([
    'owner',
    'basePath',
    'languages',
    'fileType'
  ]);

  const getLoadingTitle = useCallback(() => {
    if (isCreateRepoLoading) return dashboardT('Creating repository');
    if (isCommitLoading) return dashboardT('Setting up repository');
    return undefined;
  }, [isCreateRepoLoading, isCommitLoading]);

  return (
    <>
      <form onSubmit={onSubmit} style={{ width: '100%' }}>
        <Stack w="100%">
          <Text fontSize="2xl">{dashboardT('Create new i18n repository')}</Text>

          <FormLabel>{commonT('Owner')}</FormLabel>
          <Controller
            name="owner"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <OwnerSelect value={field.value} onChange={field.onChange} />
            )}
          />

          <FormLabel>{commonT('Repository name')}</FormLabel>
          <Input
            {...register('name')}
            placeholder="xxxxx-locales"
            name="name"
            required
          />

          <RadioGroup defaultValue={REPOSITORY_VISIBILITY[0]}>
            <HStack spacing={4}>
              {REPOSITORY_VISIBILITY.map((value) => (
                <Radio {...register('visibility')} key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </HStack>
          </RadioGroup>

          <FormLabel>{commonT('Base path')}</FormLabel>
          <Input {...register('basePath')} placeholder="/" name="basePath" />

          <FormLabel>{commonT('File structure')}</FormLabel>
          <RadioGroup defaultValue={LOCALES_FILE_STRUCTURE[0]}>
            <Stack flexWrap="wrap">
              {LOCALES_FILE_STRUCTURE.map((value) => (
                <Radio
                  {...register('fileStructure')}
                  key={value}
                  value={value}
                  maxW="100%">
                  {basePath}/{value}.{fileType}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>

          <FormLabel>{commonT('File type')}</FormLabel>
          <RadioGroup defaultValue={LOCALES_FILE_TYPE[0]}>
            <HStack spacing={4}>
              {LOCALES_FILE_TYPE.map((value) => (
                <Radio {...register('fileType')} key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </HStack>
          </RadioGroup>

          <FormLabel>{commonT('Languages')}</FormLabel>
          <Controller
            name="languages"
            control={control}
            rules={{ required: true }}
            defaultValue={['en', 'zh']}
            render={({ field: { value, onChange } }) => (
              <TagInput value={value} onChange={onChange} />
            )}
          />

          <FormLabel>{commonT('Namespaces')}</FormLabel>
          <Controller
            name="namespaces"
            control={control}
            rules={{ required: true }}
            defaultValue={['translationA', 'translationB']}
            render={({ field: { value, onChange } }) => (
              <TagInput value={value} onChange={onChange} />
            )}
          />

          <FormLabel>{commonT('Default language')}</FormLabel>
          <Select {...register('defaultLanguage')}>
            {languages?.map((language) => (
              <option value={language} key={language}>
                {language}
              </option>
            ))}
          </Select>

          <Button type="submit" isLoading={!owner}>
            {commonT('Create')}
          </Button>
        </Stack>
      </form>
      {isLoading && <LoadingModal title={getLoadingTitle()} />}
    </>
  );
};

export default CreateNewRepoForm;
