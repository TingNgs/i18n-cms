import { useCallback, useState } from 'react';
import { useToast, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useCommitGithubFilesMutation } from '../../../redux/services/octokitApi';
import { RootState, useAppDispatch, useAppStore } from '../../../redux/store';
import { dataToFiles, getLocalePath } from '../../../utils/fileHelper';
import { createSelector } from '@reduxjs/toolkit';
import { saveLocaleSuccess } from '../../../redux/editingRepoSlice';
import { without } from 'lodash-es';

export const isDataChangedSelector = createSelector(
  (state: RootState) => state.EditingRepoReducer,
  ({
    originalLocalesData,
    modifiedLocalesData,
    languages,
    localeIds,
    namespaces,
    originalLanguages
  }) => {
    // Removed namespace
    if (without(Object.keys(originalLocalesData), ...namespaces).length)
      return true;

    // Removed language
    if (without(originalLanguages, ...languages).length) return true;

    // New language
    if (without(languages, ...originalLanguages).length) return true;

    const modifiedNamespaces = Object.keys(modifiedLocalesData);
    const data: {
      [namespace: string]: { [language: string]: { [key: string]: string } };
    } = {};
    for (const namespace of modifiedNamespaces) {
      data[namespace] = {};
      for (const language of languages) {
        data[namespace][language] = {};
        for (const localeId of localeIds[namespace]) {
          const localeData = modifiedLocalesData[namespace][localeId];
          const locale = localeData['value'][language];
          if (locale) data[namespace][language][localeData['key']] = locale;
        }
        if (
          JSON.stringify(data[namespace]?.[language]) ===
          JSON.stringify(originalLocalesData[namespace]?.[language])
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
  const { t } = useTranslation();
  const { t: repoT } = useTranslation('repo');
  const [commitGithubFiles] = useCommitGithubFilesMutation();
  const [isLoading, setLoading] = useState(false);

  const saveEditing = useCallback(
    async ({ commitMessage }: { commitMessage: string }) => {
      try {
        setLoading(true);
        const {
          languages,
          namespaces,
          branch,
          localeIds,
          editingRepo,
          editingRepoConfig,
          originalLanguages,
          originalNamespaces,
          originalLocalesData,
          modifiedLocalesData
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
            for (const localeId of localeIds[namespace]) {
              const localeData = modifiedLocalesData[namespace][localeId];
              const locale = localeData['value'][language];
              if (data[namespace][language][localeData['key']]) {
                toast({
                  title: repoT('Please remove all duplicated key'),
                  status: 'error'
                });
                return;
              }
              if (locale) data[namespace][language][localeData['key']] = locale;
            }
            if (
              JSON.stringify(data[namespace]?.[language]) ===
              JSON.stringify(originalLocalesData[namespace]?.[language])
            ) {
              delete data[namespace][language];
            }
          }
          if (Object.keys(data[namespace]).length === 0) {
            delete data[namespace];
          }
        }

        // New language with unchanged namespaces
        const newLanguages = without(languages, ...originalLanguages);
        if (newLanguages.length) {
          const unchangedNamespaces = without(
            namespaces,
            ...modifiedNamespaces
          );
          for (const namespace of unchangedNamespaces) {
            data[namespace] = {};
            for (const language of newLanguages) {
              data[namespace][language] = {};
            }
          }
        }

        if (!editingRepo || !branch || !editingRepoConfig) return;

        const removedNamespaces = without(originalNamespaces, ...namespaces);
        const removedLanguages = without(originalLanguages, ...languages);

        const filesToDeleteSet = new Set<string>();
        // Removed languages
        removedLanguages.forEach((language) => {
          originalNamespaces.forEach((namespace) => {
            const path = getLocalePath({
              language,
              namespace,
              repoConfig: editingRepoConfig
            });
            filesToDeleteSet.add(path);
          });
        });

        // Removed namespaces
        removedNamespaces.forEach((namespace) => {
          originalLanguages.forEach((language) => {
            const path = getLocalePath({
              language,
              namespace,
              repoConfig: editingRepoConfig
            });
            filesToDeleteSet.add(path);
          });
        });

        const { commit } = await commitGithubFiles({
          owner: editingRepo.owner,
          repo: editingRepo.repo,
          branch: branch,
          change: {
            message: commitMessage,
            filesToDelete: Array.from(filesToDeleteSet),
            ignoreDeletionFailures: true,
            files: dataToFiles({
              data,
              languages,
              namespaces: Object.keys(data),
              repoConfig: {
                ...editingRepoConfig,
                ...(editingRepoConfig.useCustomPath
                  ? {
                      languages,
                      namespaces
                    }
                  : {})
              }
            })
          }
        }).unwrap();

        dispatch(saveLocaleSuccess(data));
        toast({
          title: (
            <Text
              dangerouslySetInnerHTML={{
                __html: repoT('Saved successfully', {
                  link: commit.html_url
                })
              }}
            />
          )
        });
      } catch (e) {
        console.log(e);
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
