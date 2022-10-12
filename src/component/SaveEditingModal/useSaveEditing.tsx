import { useCallback } from 'react';
import { useToast, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useCommitGithubFilesMutation } from '../../redux/services/octokitApi';
import { useAppStore } from '../../redux/store';
import { dataToFiles } from '../../utils/fileHelper';

const useSaveEditing = () => {
  const { getState } = useAppStore();
  const toast = useToast();
  const [t] = useTranslation();
  const [commitGithubFiles] = useCommitGithubFilesMutation();

  const saveEditing = useCallback(
    async ({ commitMessage }: { commitMessage: string }) => {
      const {
        originalLocalesData,
        modifiedLocalesData,
        languages,
        localeKeys,
        branch,
        editingRepo,
        editingRepoConfig
      } = getState().EditingRepoReducer;

      const modifiedNamespaces = Object.keys(modifiedLocalesData);
      const data: {
        [namespace: string]: { [language: string]: { [key: string]: string } };
      } = {};
      modifiedNamespaces.forEach((namespace) => {
        data[namespace] = {};
        languages.forEach((language) => {
          data[namespace][language] = {};
          localeKeys[namespace].forEach((key) => {
            const locale = modifiedLocalesData[namespace][language][key];
            if (locale) data[namespace][language][key] = locale;
          });
          if (
            JSON.stringify(data[namespace][language]) ===
            JSON.stringify(originalLocalesData[namespace][language])
          ) {
            delete data[namespace][language];
          }
        });
      });

      if (!editingRepo || !branch || !editingRepoConfig) return;
      const { commit } = await commitGithubFiles({
        owner: editingRepo.owner,
        repo: editingRepo.repo,
        branch: branch,
        change: {
          message: commitMessage,
          files: dataToFiles({
            data,
            languages,
            namespaces: modifiedNamespaces,
            repoConfig: editingRepoConfig
          })
        }
      }).unwrap();

      toast({
        title: (
          <Text
            dangerouslySetInnerHTML={{
              __html: t('Saved successfully', {
                link: commit.html_url
              })
            }}
          />
        )
      });
    },
    []
  );

  return saveEditing;
};

export default useSaveEditing;
