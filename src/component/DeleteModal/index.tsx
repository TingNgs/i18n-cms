import { ReactNode, useRef } from 'react';
import {
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: ReactNode;
  content?: ReactNode;
  isLoading?: boolean;
}

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  content,
  isLoading
}: IProps) => {
  const { t } = useTranslation();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}>
      <AlertDialogOverlay />
      <AlertDialogContent>
        {title && <AlertDialogHeader>{title}</AlertDialogHeader>}
        <AlertDialogBody> {content}</AlertDialogBody>
        <AlertDialogFooter gap={4}>
          <Button
            data-e2e-id="popover_delete_cancel"
            variant="outline"
            onClick={onClose}
            ref={cancelRef}>
            {t('Cancel')}
          </Button>
          <Button
            data-e2e-id="popover_delete_confirm"
            colorScheme="red"
            onClick={onConfirm}
            isLoading={isLoading}>
            {t('Delete')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteModal;
