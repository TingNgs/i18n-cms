import { ModifiedLocalesData } from '../../../../redux/editingRepoSlice';

self.onmessage = async (message) => {
  const {
    localesData,
    localeIds,
    findText,
    languages
  }: {
    localesData: { [id: string]: ModifiedLocalesData };
    localeIds: string[];
    findText: string;
    languages: string[];
  } = message.data;
  const result = localeIds.reduce<
    {
      id: string;
      row: number;
    }[]
  >((acc, id, index) => {
    const locale = localesData[id];
    if (
      locale.key.includes(findText) ||
      languages.some((language) => locale.value[language]?.includes(findText))
    ) {
      acc.push({ id, row: index });
    }

    return acc;
  }, []);
  self.postMessage(result);
};
