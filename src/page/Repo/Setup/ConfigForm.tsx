import { useCallback, useState } from 'react';
import {
  Stack,
  FormLabel,
  Text,
  Divider,
  Input,
  Button,
  Select,
  Flex,
  Tag
} from '@chakra-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon } from '@chakra-ui/icons';

import { LOCALES_FILE_TYPE, LOCALES_FILE_TYPE_MAP } from '../../../constants';
import useGetNamespaces from '../hooks/getNamespaces';
import TagInput from '../../../component/TagInput';
import { FormValues } from './interface';
import BranchInput from './BranchInput';
import { Repo } from '../../../redux/editingRepoSlice';
import { useLazyGetGithubBranchQuery } from '../../../redux/services/octokitApi';

interface IProps {
  repo: Repo;
  onCancel: () => void;
  showConfigForm: boolean;
}

const ConfigForm = ({ repo, onCancel, showConfigForm }: IProps) => {
  const { t } = useTranslation('repo');
  const { t: commonT } = useTranslation();

  const [isLoading, setLoading] = useState(false);
  const [namespaces, setNamespaces] = useState<string[] | null>(null);

  const [getGithubBranch] = useLazyGetGithubBranchQuery();
  const [getNamespaces] = useGetNamespaces();

  const { register, watch, getValues, control } = useFormContext<FormValues>();

  const [languages] = watch(['config.languages']);

  const onTestConfigClick = useCallback(async () => {
    const { action, baseOn, existingBranchName, config } = getValues();
    setLoading(true);
    setNamespaces([]);
    if (!config) return;
    console.log(config);
    try {
      const branch = await getGithubBranch({
        repo: repo.repo,
        owner: repo.owner,
        branch: action === 'create' ? baseOn : existingBranchName
      }).unwrap();
      const data = await getNamespaces({
        repo,
        repoConfig: config,
        rootSha: branch.commit.commit.tree.sha
      });
      setNamespaces(data);
    } finally {
      setLoading(false);
    }
  }, [repo, getNamespaces, getValues]);

  return (
    <Stack display={showConfigForm ? 'flex' : 'none'}>
      <Button
        size="sm"
        variant="link"
        onClick={onCancel}
        alignSelf="flex-start"
        leftIcon={<ChevronLeftIcon />}>
        {t('Use another branch')}
      </Button>
      <Text fontSize="2xl" fontWeight="semibold">
        {t('Setup config')}
      </Text>
      <BranchInput showConfigForm={showConfigForm} />
      <Divider />
      <FormLabel>{commonT('File type')}</FormLabel>
      <Select
        {...register('config.fileType')}
        defaultValue={LOCALES_FILE_TYPE[0]}>
        {LOCALES_FILE_TYPE.map((value) => (
          <option value={value} key={value}>
            {LOCALES_FILE_TYPE_MAP[value].label}
          </option>
        ))}
      </Select>

      <FormLabel>{commonT('File path pattern')}</FormLabel>
      <Input
        {...register('config.pattern')}
        placeholder=":lng/:ns"
        defaultValue=":lng/:ns"
      />

      <FormLabel>{commonT('Languages')}</FormLabel>
      <Controller
        name="config.languages"
        control={control}
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => (
          <TagInput value={value} onChange={onChange} />
        )}
      />

      <FormLabel>{commonT('Default language')}</FormLabel>
      <Select {...register('config.defaultLanguage')}>
        {languages?.map((language) => (
          <option value={language} key={language}>
            {language}
          </option>
        ))}
      </Select>

      <Button
        colorScheme="green"
        onClick={onTestConfigClick}
        isLoading={isLoading}>
        {t('Test Config')}
      </Button>
      {namespaces !== null && (
        <Flex gap={2}>
          <Text>{commonT('Namespaces')} : </Text>
          {namespaces.map((namespace, index) => (
            <Tag key={index}>{namespace}</Tag>
          ))}
          {!isLoading && namespaces.length === 0 && (
            <Text>{t('Namespaces not found')}</Text>
          )}
        </Flex>
      )}
    </Stack>
  );
};

export default ConfigForm;
