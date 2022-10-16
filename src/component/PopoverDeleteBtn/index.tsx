import { memo, PropsWithChildren, ReactNode } from 'react';
import {
  ButtonGroup,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  Portal,
  PopoverBody,
  PopoverFooter,
  useBreakpointValue
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import DeleteModal from '../DeleteModal';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onConfirm: () => void;
  title?: ReactNode;
  content?: ReactNode;
}

const PopoverDeleteBtn = ({
  isOpen,
  onOpen,
  onClose,
  onConfirm,
  title,
  content,
  children
}: PropsWithChildren<IProps>) => {
  const isLg = useBreakpointValue({ base: false, lg: true });

  const { t } = useTranslation();

  return (
    <>
      <Popover onOpen={onOpen} isOpen={isLg && isOpen} onClose={onClose}>
        <PopoverTrigger>{children}</PopoverTrigger>
        <Portal>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody>{content}</PopoverBody>
            <PopoverFooter>
              <ButtonGroup size="sm">
                <Button variant="outline" onClick={onClose}>
                  {t('Cancel')}
                </Button>
                <Button colorScheme="red" onClick={onConfirm}>
                  {t('Delete')}
                </Button>
              </ButtonGroup>
            </PopoverFooter>
          </PopoverContent>
        </Portal>
      </Popover>

      <DeleteModal
        title={title}
        content={content}
        onClose={onClose}
        onConfirm={onConfirm}
        isOpen={isOpen && !isLg}
      />
    </>
  );
};

export default memo(PopoverDeleteBtn);
