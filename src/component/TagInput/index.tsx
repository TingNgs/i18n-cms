import { Flex } from '@chakra-ui/react';
import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteTag
} from '@choc-ui/chakra-autocomplete';

interface IProps {
  value: string[];
  e2eTitle?: string;
  onChange: (value: string[]) => void;
}

const TagInput = ({ value, e2eTitle, onChange }: IProps) => {
  return (
    <Flex>
      <AutoComplete creatable multiple onChange={onChange} values={value}>
        <AutoCompleteInput
          data-e2e-id={`${e2eTitle}-tag-input`}
          flexWrap="nowrap"
          required={value.length === 0}>
          {({ tags }) =>
            tags.map((tag, tid) => (
              <AutoCompleteTag
                data-e2e-id={`${e2eTitle}-tag`}
                key={tid}
                label={tag.label}
                onRemove={tag.onRemove}
              />
            ))
          }
        </AutoCompleteInput>
      </AutoComplete>
    </Flex>
  );
};

export default TagInput;
