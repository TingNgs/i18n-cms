import { noop, debounce } from 'lodash-es';
import { useCallback, useEffect } from 'react';
import {
  ModifiedLocalesData,
  setFindMatches
} from '../../../../redux/editingRepoSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';

const useFindMatches = () => {
  const dispatch = useAppDispatch();

  const { findText, localesData, localeIds, languages } = useAppSelector(
    (state) => ({
      findText: state.EditingRepoReducer.findText,
      localesData:
        state.EditingRepoReducer.modifiedLocalesData[
          state.EditingRepoReducer.selectedNamespace || ''
        ],
      localeIds:
        state.EditingRepoReducer.localeIds[
          state.EditingRepoReducer.selectedNamespace || ''
        ],
      languages: state.EditingRepoReducer.languages
    })
  );

  const runWorker = useCallback(
    debounce(
      (data: {
        localesData: { [id: string]: ModifiedLocalesData };
        localeIds: string[];
        findText: string;
        languages: string[];
      }) => {
        const worker = new Worker(new URL('./worker.ts', import.meta.url));
        worker.postMessage(data);
        worker.addEventListener('message', (message) => {
          dispatch(setFindMatches({ findMatches: message.data }));
          worker.terminate();
        });
        return worker;
      },
      200,
      { leading: true }
    ),
    []
  );

  useEffect(() => {
    if (!localesData || !localeIds || !findText) {
      return () => {
        noop();
      };
    }

    const worker = runWorker({
      localesData,
      localeIds,
      languages,
      findText
    });

    return () => {
      worker?.terminate();
    };
  }, [findText, localesData, localeIds, languages]);
};

export default useFindMatches;
