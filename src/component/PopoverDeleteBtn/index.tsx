import {
  memo,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useState
} from 'react';
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
  useBreakpointValue,
  useDisclosure
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import DeleteModal from '../DeleteModal';

interface IProps {
  onConfirm: () => Promise<void> | void;
  title?: ReactNode;
  content?: ReactNode;
}

const PopoverDeleteBtn = ({
  onConfirm,
  title,
  content,
  children
}: PropsWithChildren<IProps>) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setLoading] = useState(false);
  const isLg = useBreakpointValue({ base: false, lg: true });

  const onDeleteClicked = useCallback(async () => {
    setLoading(true);
    await onConfirm();
    onClose();
  }, [onConfirm]);

  const { t } = useTranslation();

  return (
    <>
      <Popover onOpen={onOpen} isOpen={isLg && isOpen} onClose={onClose}>
        <PopoverTrigger>{children}</PopoverTrigger>
        <Portal>
          <PopoverContent onClick={(e) => e.stopPropagation()}>
            <PopoverArrow />
            <PopoverBody>{content}</PopoverBody>
            <PopoverFooter>
              <ButtonGroup size="sm">
                <Button
                  data-e2e-id="delete_cancel"
                  variant="outline"
                  onClick={onClose}>
                  {t('Cancel')}
                </Button>
                <Button
                  data-e2e-id="delete_confirm"
                  colorScheme="red"
                  onClick={onDeleteClicked}
                  isLoading={isLoading}>
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
        onConfirm={onDeleteClicked}
        isLoading={isLoading}
        isOpen={isOpen && !isLg}
      />
    </>
  );
};

export default memo(PopoverDeleteBtn);
