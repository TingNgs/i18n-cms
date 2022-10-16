import { ButtonGroup, Flex } from '@chakra-ui/react';
import { memo } from 'react';

import { CELL_PROPS } from '../../../constants';
import DeleteBtn from './DeleteBtn';

const ActionCell = ({
  localeId,
  localeKey,
  index
}: {
  localeId?: string;
  localeKey?: string;
  index?: number;
}) => {
  return (
    <Flex
      {...CELL_PROPS}
      flex="none"
      flexShrink={0}
      minWidth="0"
      position={'sticky'}
      right="0">
      <ButtonGroup
        isAttached
        size="sm"
        visibility={localeId ? 'visible' : 'hidden'}
        pointerEvents={localeId ? 'initial' : 'none'}>
        <DeleteBtn localeKey={localeKey} index={index} />
      </ButtonGroup>
    </Flex>
  );
};

export default memo(ActionCell);
