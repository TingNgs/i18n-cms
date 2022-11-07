import { memo } from 'react';
import { SearchIcon } from '@chakra-ui/icons';
import {
  IconButton,
  Input,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../../redux/store';
import { handleSearch } from '../../../redux/editingRepoSlice';

const SearchBar = () => {
  const dispatch = useAppDispatch();
  const { register, handleSubmit } = useForm<{ search: string }>();

  const onSubmit = handleSubmit((values) => {
    dispatch(handleSearch({ text: values.search }));
  });

  return (
    <form onSubmit={onSubmit} style={{ width: '100%' }}>
      <InputGroup size="sm">
        <Input {...register('search')} borderRadius="5" />
        <InputRightElement>
          <IconButton
            type="submit"
            icon={<SearchIcon />}
            aria-label="search-button"
            size="sm"
            variant="ghost"
          />
        </InputRightElement>
      </InputGroup>
    </form>
  );
};

export default memo(SearchBar);
