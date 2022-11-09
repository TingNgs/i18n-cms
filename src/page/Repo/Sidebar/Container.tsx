import { memo, PropsWithChildren } from 'react';

import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  useBreakpointValue
} from '@chakra-ui/react';

import { SIDEBAR_WIDTH } from '../constants';

const Container = ({
  onClose,
  isOpen,
  children
}: PropsWithChildren<{
  onClose: () => void;
  isOpen: boolean;
}>) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return isMobile ? (
    <Drawer size="xs" placement="left" onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay />
      <DrawerContent overflow="scroll">
        {children}
        <DrawerCloseButton size="md" top="0.8rem" />
      </DrawerContent>
    </Drawer>
  ) : (
    <Flex
      boxShadow="1px 1px 1px var(--chakra-colors-chakra-border-color)"
      position="absolute"
      h="100%"
      w={`${SIDEBAR_WIDTH}px`}
      flexDir="column"
      transition="left 0.3s"
      left={isOpen ? '0' : `-${SIDEBAR_WIDTH}px`}
      zIndex="1"
      overflow="scroll">
      {children}
    </Flex>
  );
};

export default memo(Container);
