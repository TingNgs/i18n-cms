import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteTag
} from '@choc-ui/chakra-autocomplete';

interface IProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const TagInput = ({ value, onChange }: IProps) => {
  return (
    <AutoComplete creatable multiple onChange={onChange} values={value}>
      <AutoCompleteInput flexWrap="nowrap" required={value.length === 0}>
        {({ tags }) =>
          tags.map((tag, tid) => (
            <AutoCompleteTag
              key={tid}
              label={tag.label}
              onRemove={tag.onRemove}
            />
          ))
        }
      </AutoCompleteInput>
    </AutoComplete>
  );
};

export default TagInput;
