import { memo, useEffect, HTMLProps, forwardRef } from 'react';
import { Flex, Spinner, Text } from '@chakra-ui/react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import { useAppDispatch, useAppSelector } from '../../../redux/store';
import useGetEditingRepoLocalByNs from '../hooks/useGetEditingRepoLocalByNs';
import { setLocalesDataByNamespace } from '../../../redux/editingRepoSlice';

import TableRow from './TableRow';
import { Cell, Row } from './View';
import { CELL_HEIGHT } from '../../../constants';

const Inner = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  function Inner({ children, ...rest }, ref) {
    const languages = useAppSelector(
      (state) => state.EditingRepoReducer.selectedLanguages
    );
    return (
      <div {...rest} ref={ref}>
        <Row position="sticky" top="0" zIndex={2}>
          <Cell position="sticky" left="0" zIndex={1}>
            <Text fontWeight="bold">Key</Text>
          </Cell>
          {languages.map((language) => (
            <Cell fontWeight="bold" key={language} flex={1}>
              <Text>{language}</Text>
            </Cell>
          ))}
        </Row>
        {children}
      </div>
    );
  }
);

const LocaleTable = () => {
  const modifiedLocalesData = useAppSelector(
    (state) => state.EditingRepoReducer.modifiedLocalesData
  );
  const namespace = useAppSelector(
    (state) => state.EditingRepoReducer.selectedNamespace
  );
  const listSize = useAppSelector(
    (state) =>
      (namespace && state.EditingRepoReducer.localeKeys[namespace]?.length) || 0
  );

  const dispatch = useAppDispatch();
  const getEditingRepoLocalByNs = useGetEditingRepoLocalByNs();

  useEffect(() => {
    const fetchNamespaceData = async () => {
      if (!namespace) return;
      const data = await getEditingRepoLocalByNs({
        namespace: namespace
      });
      if (!data) return;
      dispatch(setLocalesDataByNamespace({ namespace, data }));
    };

    if (namespace && !modifiedLocalesData[namespace]) {
      fetchNamespaceData();
    }
  }, [namespace, modifiedLocalesData]);
  if (!namespace) return null;

  return (
    <Flex flexGrow={1} overflow="scroll">
      {listSize > 0 ? (
        <AutoSizer>
          {({ height, width }) => (
            <List
              key={namespace}
              height={height}
              itemCount={listSize + 1}
              itemSize={CELL_HEIGHT}
              width={width}
              innerElementType={Inner}>
              {TableRow}
            </List>
          )}
        </AutoSizer>
      ) : (
        <Flex flex="1" alignItems="center" justifyContent="center">
          <Spinner />
        </Flex>
      )}
    </Flex>
  );
};

export default memo(LocaleTable);
