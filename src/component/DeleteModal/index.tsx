import { ReactNode } from 'react';
import {
  ModalHeader,
  Modal,
  ModalContent,
  ModalBody,
  ButtonGroup,
  Button,
  Stack,
  ModalOverlay
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: ReactNode;
  content?: ReactNode;
}

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  content
}: IProps) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset="none">
      <ModalOverlay />
      <ModalContent>
        {title && <ModalHeader>{title}</ModalHeader>}
        <ModalBody>
          <Stack spacing={4}>
            {content}
            <ButtonGroup>
              <Button variant="outline" onClick={onClose}>
                {t('Cancel')}
              </Button>
              <Button colorScheme="red" onClick={onConfirm}>
                {t('Delete')}
              </Button>
            </ButtonGroup>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DeleteModal;
