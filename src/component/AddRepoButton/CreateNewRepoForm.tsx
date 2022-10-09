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
  useToast
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import {
  LOCALES_FILE_STRUCTURE,
  LOCALES_FILE_TYPE,
  REPOSITORY_VISIBILITY
} from '../../constants';
import {
  useCreateGithubRepoMutation,
  useCommitGithubFilesMutation
} from '../../redux/services/octokitApi';

import TagInput from '../TagInput';
import { dataToFiles } from '../../utils/fileHelper';
import OwnerSelect, { Owner } from '../OwnerSelect';
import LoadingModal from '../LoadingModel';

const CreateNewRepoForm = () => {
  const toast = useToast();
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState(false);

  const [createGithubRepo, { isLoading: isCreateRepoLoading }] =
    useCreateGithubRepoMutation();
  const [commitGithubFiles, { isLoading: isCommitLoading }] =
    useCommitGithubFilesMutation();

  const { handleSubmit, register, control, watch } = useForm<{
    owner: Owner;
    name: string;
    basePath: string;
    fileStructure: typeof LOCALES_FILE_STRUCTURE[number];
    fileType: typeof LOCALES_FILE_TYPE[number];
    visibility: typeof REPOSITORY_VISIBILITY[number];
    languages: string[];
    namespaces: string[];
  }>();

  const onSubmit = handleSubmit(async (values) => {
    try {
      setLoading(true);
      const repo = await createGithubRepo({
        name: values.name,
        visibility: values.visibility,
        owner
      })
        .unwrap()
        .catch((e) => {
          toast({ title: t('Create new repo fail'), status: 'error' });
          throw e;
        });

      await commitGithubFiles({
        owner: repo.owner.login,
        repo: repo.name,
        branch: repo.default_branch,
        change: {
          message: 'Initial locales',
          files: dataToFiles(values)
        }
      }).catch((e) => {
        toast({ title: t('Setup new repo fail'), status: 'error' });
        throw e;
      });
    } finally {
      setLoading(false);
    }
  });

  const [owner, basePath] = watch(['owner', 'basePath']);

  const getLoadingTitle = useCallback(() => {
    if (isCreateRepoLoading) return t('Createing repository');
    if (isCommitLoading) return t('Setuping repository');
    return undefined;
  }, []);

  return (
    <>
      <form onSubmit={onSubmit} style={{ width: '100%' }}>
        <Stack w="100%">
          <Text fontSize="2xl">{t('Create new i18n repository')}</Text>

          <FormLabel>{t('Owner')}</FormLabel>
          <Controller
            name="owner"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <OwnerSelect value={field.value} onChange={field.onChange} />
            )}
          />

          <FormLabel>{t('Repository name')}</FormLabel>
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

          <FormLabel>{t('Base path')}</FormLabel>
          <Input {...register('basePath')} placeholder="/" name="basePath" />

          <FormLabel>{t('File structure')}</FormLabel>
          <RadioGroup defaultValue={LOCALES_FILE_STRUCTURE[0]}>
            <Stack flexWrap="wrap">
              {LOCALES_FILE_STRUCTURE.map((value) => (
                <Radio
                  {...register('fileStructure')}
                  key={value}
                  value={value}
                  maxW="100%">
                  {basePath}/{value}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>

          <FormLabel>{t('File type')}</FormLabel>
          <RadioGroup defaultValue={LOCALES_FILE_TYPE[0]}>
            <HStack spacing={4}>
              {LOCALES_FILE_TYPE.map((value) => (
                <Radio {...register('fileType')} key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </HStack>
          </RadioGroup>

          <FormLabel>{t('Languages')}</FormLabel>
          <Controller
            name="languages"
            control={control}
            rules={{ required: true }}
            defaultValue={['en', 'zh']}
            render={({ field: { value, onChange } }) => (
              <TagInput value={value} onChange={onChange} />
            )}
          />

          <FormLabel>{t('Namespaces')}</FormLabel>
          <Controller
            name="namespaces"
            control={control}
            rules={{ required: true }}
            defaultValue={['translationA', 'translationB']}
            render={({ field: { value, onChange } }) => (
              <TagInput value={value} onChange={onChange} />
            )}
          />

          <Button type="submit" isLoading={!owner}>
            {t('Create')}
          </Button>
        </Stack>
      </form>
      {isLoading && <LoadingModal title={getLoadingTitle()} />}
    </>
  );
};

export default CreateNewRepoForm;
