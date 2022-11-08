import { memo, useEffect } from 'react';
import { SearchIcon } from '@chakra-ui/icons';
import {
  IconButton,
  Input,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { setSearchText } from '../../../redux/editingRepoSlice';

const SearchBar = () => {
  const { t } = useTranslation('repo');
  const dispatch = useAppDispatch();
  const { register, handleSubmit, setValue } = useForm<{ search: string }>();
  const { searchText, selectedNamespace } = useAppSelector((state) => ({
    searchText: state.EditingRepoReducer.searchText,
    selectedNamespace: state.EditingRepoReducer.selectedNamespace
  }));

  useEffect(() => {
    setValue('search', searchText);
  }, [searchText, selectedNamespace]);

  const onSubmit = handleSubmit((values) => {
    dispatch(setSearchText({ text: values.search }));
  });

  return (
    <form onSubmit={onSubmit} style={{ width: '100%' }}>
      <InputGroup size="sm">
        <Input
          {...register('search')}
          disabled={!selectedNamespace}
          borderRadius="5"
          placeholder={t('Search by key or value')}
        />
        <InputRightElement>
          <IconButton
            type="submit"
            icon={<SearchIcon />}
            aria-label="search-button"
            size="sm"
            variant="ghost"
            disabled={!selectedNamespace}
          />
        </InputRightElement>
      </InputGroup>
    </form>
  );
};

export default memo(SearchBar);
