import { Dispatch, SetStateAction } from 'react';
import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteItem,
  AutoCompleteList
} from '@choc-ui/chakra-autocomplete';
import { Repo, useGetGithubRepoQuery } from '../../redux/services/octokitApi';

interface IProps {
  setSelectedRepo: Dispatch<SetStateAction<undefined | Repo>>;
}

const GithubRepoSelect = ({ setSelectedRepo }: IProps) => {
  const { data } = useGetGithubRepoQuery({});

  return (
    <AutoComplete
      openOnFocus
      suggestWhenEmpty
      onChange={(value: string) => {
        setSelectedRepo(data?.find((repo) => repo.full_name === value));
      }}>
      <AutoCompleteInput variant="filled" />
      <AutoCompleteList>
        {data?.map((repo) => (
          <AutoCompleteItem key={`option-${repo.id}`} value={repo.full_name}>
            {repo.full_name}
          </AutoCompleteItem>
        ))}
      </AutoCompleteList>
    </AutoComplete>
  );
};

export default GithubRepoSelect;
