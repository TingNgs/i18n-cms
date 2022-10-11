import { Text } from '@chakra-ui/react';
import { CSSProperties, memo } from 'react';
import { useAppSelector } from '../../../redux/store';
import TableCell from './TableCell';
import { Cell, Row } from './View';

const TableRow = ({
  index,
  style
}: {
  index: number;
  style: CSSProperties;
}) => {
  const languages = useAppSelector(
    (state) => state.EditingRepoReducer.selectedLanguages
  );

  const key = useAppSelector((state) =>
    index > 0 && state.EditingRepoReducer.selectedNamespace
      ? state.EditingRepoReducer.localeKeys[
          state.EditingRepoReducer.selectedNamespace
        ][index - 1]
      : ''
  );

  if (index === 0) return null;
  return (
    <Row style={style}>
      <Cell position="sticky" left="0" zIndex={1}>
        <Text fontWeight="bold">{key}</Text>
      </Cell>
      {languages.map((language) => (
        <TableCell key={language} language={language} localeKey={key} />
      ))}
    </Row>
  );
};

export default memo(TableRow);
