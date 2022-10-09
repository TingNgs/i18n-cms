import { useState, useEffect } from 'react';
import {
  Stack,
  Spinner,
  Modal,
  ModalContent,
  ModalBody,
  Text,
  SlideFade
} from '@chakra-ui/react';

interface IProps {
  title?: string;
}

const LoadingModal = ({ title }: IProps) => {
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    setShowTitle(!!title);
  }, [title]);

  return (
    <Modal isOpen onClose={() => null} motionPreset="none">
      <ModalContent>
        <ModalBody>
          <Stack
            position="fixed"
            top="0"
            left="0"
            w="100%"
            h="100%"
            alignItems="center"
            justifyContent="center"
            backgroundColor="blue.800"
            flexDir="column">
            <Spinner size="xl" />
            {title && (
              <SlideFade key={title} in={showTitle} offsetY="20" unmountOnExit>
                <Text color="blue.300">{title}</Text>
              </SlideFade>
            )}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LoadingModal;
