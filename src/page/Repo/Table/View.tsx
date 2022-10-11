import { Flex } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { CELL_HEIGHT } from '../../../constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Cell = (props: PropsWithChildren<any>) => (
  <Flex
    flex={1}
    padding="0 12px"
    minWidth="300px"
    backgroundColor="white"
    alignItems="center"
    height="100%"
    borderBottomWidth={1}
    {...props}
  />
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Row = (props: PropsWithChildren<any>) => (
  <Flex
    height={`${CELL_HEIGHT}px`}
    backgroundColor="white"
    alignItems="center"
    {...props}
  />
);
