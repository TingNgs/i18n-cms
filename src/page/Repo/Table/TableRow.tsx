import { CSSProperties, memo } from 'react';
import { useAppSelector } from '../../../redux/store';
import KeyCell from './KeyCell';
import TableCell from './TableCell';
import { Row } from './View';

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
      <KeyCell localeKey={key} index={index - 1} />
      {languages.map((language) => (
        <TableCell key={language} language={language} localeKey={key} />
      ))}
    </Row>
  );
};

export default memo(TableRow);
