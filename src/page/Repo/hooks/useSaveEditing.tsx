import { useCallback, useState } from 'react';
import { useToast, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { createSelector } from '@reduxjs/toolkit';
import { get, without } from 'lodash-es';

import { useCommitFilesMutation } from '../../../redux/services/octokitApi';
import { RootState, useAppDispatch, useAppStore } from '../../../redux/store';
import {
  dataStringifyByType,
  dataToFiles,
  getLocalePath
} from '../../../utils/fileHelper';
import { saveLocaleSuccess } from '../../../redux/editingRepoSlice';

export const isDataChangedSelector = createSelector(
  (state: RootState) => state.EditingRepoReducer.editingRepoConfig,
  (state: RootState) => state.EditingRepoReducer.originalLocalesData,
  (state: RootState) => state.EditingRepoReducer.modifiedLocalesData,
  (state: RootState) => state.EditingRepoReducer.languages,
  (state: RootState) => state.EditingRepoReducer.localeIds,
  (state: RootState) => state.EditingRepoReducer.namespaces,
  (state: RootState) => state.EditingRepoReducer.originalLanguages,
  (
    editingRepoConfig,
    originalLocalesData,
    modifiedLocalesData,
    languages,
    localeIds,
    namespaces,
    originalLanguages
  ) => {
    if (!editingRepoConfig) return false;

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
          const localeKey = localeData['key'];
          const locale = get(localeData, ['value', language]);
          const oldLocale = get(originalLocalesData, [
            namespace,
            language,
            localeKey
          ]);
          if ((locale || oldLocale) && locale !== oldLocale) {
            return true;
          }

          if (locale !== undefined)
            data[namespace][language][localeKey] = locale;
        }
        if (
          dataStringifyByType[editingRepoConfig.fileType](
            data[namespace]?.[language]
          ) ===
          dataStringifyByType[editingRepoConfig.fileType](
            originalLocalesData[namespace]?.[language]
          )
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
  const [commitFiles] = useCommitFilesMutation();
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
        if (!editingRepoConfig) return;

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
              if (locale !== undefined)
                data[namespace][language][localeData['key']] = locale;
            }

            if (
              dataStringifyByType[editingRepoConfig.fileType](
                data[namespace][language]
              ) ===
              dataStringifyByType[editingRepoConfig.fileType](
                originalLocalesData[namespace]?.[language]
              )
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
        for (const language of removedLanguages) {
          for (const namespace of originalNamespaces) {
            const path = await getLocalePath({
              language,
              namespace,
              repoConfig: editingRepoConfig
            });
            filesToDeleteSet.add(path);
          }
        }

        // Removed namespaces
        for (const namespace of removedNamespaces) {
          for (const language of originalLanguages) {
            const path = await getLocalePath({
              language,
              namespace,
              repoConfig: editingRepoConfig
            });
            filesToDeleteSet.add(path);
          }
        }
        const files = await dataToFiles({
          data,
          namespaces: Object.keys(data),
          repoConfig: {
            ...editingRepoConfig,
            languages,
            ...(editingRepoConfig.useCustomPath
              ? {
                  namespaces
                }
              : {})
          }
        });
        const commit = await commitFiles({
          owner: editingRepo.owner,
          repo: editingRepo.repo,
          branch: branch,
          change: {
            message: commitMessage,
            filesToDelete: Array.from(filesToDeleteSet),
            ignoreDeletionFailures: true,
            files
          }
        }).unwrap();

        dispatch(saveLocaleSuccess(data));
        toast({
          title: (
            <Text
              dangerouslySetInnerHTML={{
                __html: repoT('Saved successfully', {
                  link: commit.url
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
