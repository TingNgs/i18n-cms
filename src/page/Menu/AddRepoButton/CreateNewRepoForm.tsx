import { useCallback, useEffect, useState } from 'react';
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
  Select,
  FormControl,
  FormErrorMessage
} from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import {
  FILE_TYPE,
  FILE_TYPE_MAP_DATA,
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
  const { t: menuT } = useTranslation('menu');
  const { t: commonT } = useTranslation('common');
  const dispatch = useAppDispatch();
  const [isLoading, setLoading] = useState(false);

  const [createGithubRepo, { isLoading: isCreateRepoLoading }] =
    useCreateGithubRepoMutation();
  const [commitGithubFiles, { isLoading: isCommitLoading }] =
    useCommitGithubFilesMutation();
  const [updateExistingRepo] = useUpdateExistingRepoMutation();

  const {
    handleSubmit,
    register,
    control,
    watch,
    getValues,
    setValue,
    setError,
    formState: { errors }
  } = useForm<{
    owner: Owner;
    name: string;
    pattern: string;
    fileType: typeof FILE_TYPE[number];
    visibility: typeof REPOSITORY_VISIBILITY[number];
    languages: string[];
    namespaces: string[];
    defaultLanguage: string;
  }>({ defaultValues: { languages: ['en', 'zh'] } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { name, visibility, namespaces, owner, ...repoConfig } = values;

      setLoading(true);
      const repo = await createGithubRepo({
        name,
        visibility,
        owner
      })
        .unwrap()
        .catch((err) => {
          toast({ title: menuT('Create new repo fail'), status: 'error' });
          throw err;
        });

      await commitGithubFiles({
        owner: repo.owner.login,
        repo: repo.name,
        branch: repo.default_branch,
        change: {
          message: 'Initial locales',
          files: dataToFiles({
            namespaces,
            repoConfig
          })
        }
      }).catch((e) => {
        toast({ title: menuT('Setup new repo fail'), status: 'error' });
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
    } catch (err: unknown) {
      if (
        (err as { message?: string })?.message?.includes?.(
          'name already exists on this account'
        )
      ) {
        setError('name', {
          message: menuT('Repository name already exists on this owner')
        });
      }
    } finally {
      setLoading(false);
    }
  });

  const [owner, languages] = watch(['owner', 'languages']);

  useEffect(() => {
    const defaultLanguage = getValues('defaultLanguage');
    if (!languages || (defaultLanguage && languages.includes(defaultLanguage)))
      return;
    setValue('defaultLanguage', languages[0]);
  }, [languages, getValues, setValue]);

  const getLoadingTitle = useCallback(() => {
    if (isCreateRepoLoading) return menuT('Creating repository');
    if (isCommitLoading) return menuT('Setting up repository');
    return undefined;
  }, [isCreateRepoLoading, isCommitLoading]);

  return (
    <>
      <form onSubmit={onSubmit} style={{ width: '100%' }}>
        <Stack w="100%">
          <Text fontSize="2xl">{menuT('Create new Github repository')}</Text>

          <FormLabel>{commonT('Owner')}</FormLabel>
          <Controller
            name="owner"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <OwnerSelect value={field.value} onChange={field.onChange} />
            )}
          />

          <FormControl isInvalid={!!errors.name} isRequired>
            <FormLabel>{commonT('Repository name')}</FormLabel>
            <Input
              {...register('name')}
              placeholder="xxxxx-locales"
              name="name"
            />
            <ErrorMessage errors={errors} name="name" as={FormErrorMessage} />
          </FormControl>

          <RadioGroup defaultValue={REPOSITORY_VISIBILITY[0]}>
            <HStack spacing={4}>
              {REPOSITORY_VISIBILITY.map((value) => (
                <Radio {...register('visibility')} key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </HStack>
          </RadioGroup>

          <FormLabel>{commonT('File type')}</FormLabel>
          <Select {...register('fileType')} defaultValue={FILE_TYPE[0]}>
            {FILE_TYPE.map((value) => (
              <option value={value} key={value}>
                {FILE_TYPE_MAP_DATA[value].label}
              </option>
            ))}
          </Select>

          <FormControl isInvalid={!!errors.pattern} isRequired>
            <FormLabel>{commonT('File path pattern')}</FormLabel>
            <Input
              {...register('pattern')}
              placeholder=":lng/:ns"
              defaultValue=":lng/:ns"
              name="pattern"
            />
          </FormControl>

          <FormControl isInvalid={!!errors.languages} isRequired>
            <FormLabel>{commonT('Languages')}</FormLabel>
            <Controller
              name="languages"
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TagInput
                  e2eTitle="languages"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </FormControl>

          <FormControl isInvalid={!!errors.namespaces} isRequired>
            <FormLabel>{commonT('Namespaces')}</FormLabel>
            <Controller
              name="namespaces"
              control={control}
              rules={{ required: true }}
              defaultValue={['translationA', 'translationB']}
              render={({ field: { value, onChange } }) => (
                <TagInput
                  e2eTitle="namespaces"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </FormControl>

          <FormLabel>{commonT('Default language')}</FormLabel>
          <Select {...register('defaultLanguage')} required>
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
