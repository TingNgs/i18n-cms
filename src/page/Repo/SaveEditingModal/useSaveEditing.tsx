import { useCallback, useState } from 'react';
import { useToast, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useCommitGithubFilesMutation } from '../../../redux/services/octokitApi';
import { RootState, useAppDispatch, useAppStore } from '../../../redux/store';
import { dataToFiles } from '../../../utils/fileHelper';
import { createSelector } from '@reduxjs/toolkit';
import { saveLocaleSuccess } from '../../../redux/editingRepoSlice';

export const isSaveEnableSelector = createSelector(
  (state: RootState) => state.EditingRepoReducer,
  ({ originalLocalesData, modifiedLocalesData, languages, localeKeys }) => {
    const modifiedNamespaces = Object.keys(modifiedLocalesData);
    const data: {
      [namespace: string]: { [language: string]: { [key: string]: string } };
    } = {};
    for (const namespace of modifiedNamespaces) {
      data[namespace] = {};
      for (const language of languages) {
        data[namespace][language] = {};
        for (const key of localeKeys[namespace]) {
          const locale = modifiedLocalesData[namespace][language][key];
          if (locale) data[namespace][language][key] = locale;
        }
        if (
          JSON.stringify(data[namespace][language]) ===
          JSON.stringify(originalLocalesData[namespace][language])
        ) {
          delete data[namespace][language];
        } else {
          return true;
        }
      }
      if (Object.keys(data[namespace]).length === 0) {
        delete data[namespace];
      } else {
        return true;
      }
    }

    return !!Object.keys(data).length;
  }
);

const useSaveEditing = () => {
  const { getState } = useAppStore();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const [t] = useTranslation();
  const [commitGithubFiles] = useCommitGithubFilesMutation();
  const [isLoading, setLoading] = useState(false);

  const saveEditing = useCallback(
    async ({ commitMessage }: { commitMessage: string }) => {
      try {
        setLoading(true);
        const {
          languages,
          branch,
          editingRepo,
          editingRepoConfig,
          originalLocalesData,
          modifiedLocalesData,
          localeKeys
        } = getState().EditingRepoReducer;

        const modifiedNamespaces = Object.keys(modifiedLocalesData);
        const data: {
          [namespace: string]: {
            [language: string]: { [key: string]: string };
          };
        } = {};
        for (const namespace of modifiedNamespaces) {
          data[namespace] = {};
          for (const language of languages) {
            data[namespace][language] = {};
            for (const key of localeKeys[namespace]) {
              const locale = modifiedLocalesData[namespace][language][key];
              if (locale) data[namespace][language][key] = locale;
            }
            if (
              JSON.stringify(data[namespace][language]) ===
              JSON.stringify(originalLocalesData[namespace][language])
            ) {
              delete data[namespace][language];
            }
          }
          if (Object.keys(data[namespace]).length === 0) {
            delete data[namespace];
          }
        }

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
              namespaces: Object.keys(data),
              repoConfig: editingRepoConfig
            })
          }
        }).unwrap();

        dispatch(saveLocaleSuccess(data));
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
      } catch {
        toast({
          title: t('Something went wrong')
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { saveEditing, isLoading };
};

export default useSaveEditing;
