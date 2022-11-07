import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  useDisclosure,
  Box,
  Text,
  Flex
} from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CreateNewRepoForm from './CreateNewRepoForm';
import ImportGithubRepoForm from './ImportGithubRepoForm';

const FORM_BUTTON_LIST = [
  { title: 'Create new Github repository', id: 'new' },
  { title: 'Import existing Github repository', id: 'import' }
] as const;

const AddRepoButton = () => {
  const [form, setForm] = useState<'new' | 'import' | undefined>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation('dashboard');

  const renderForm = useCallback(() => {
    switch (form) {
      case 'new':
        return <CreateNewRepoForm />;
      case 'import':
        return <ImportGithubRepoForm />;
      default:
        return FORM_BUTTON_LIST.map((button, index) => (
          <Box
            key={button.id}
            cursor="pointer"
            alignItems="flex-start"
            position="relative"
            w={{ base: '100%', md: `${100 / FORM_BUTTON_LIST.length}%` }}
            paddingBottom={`${100 / FORM_BUTTON_LIST.length}%`}
            {...(index === 0
              ? {
                  borderRightWidth: { base: '0px', md: '1px' },
                  borderBottomWidth: { base: '1px', md: '0px' }
                }
              : {})}
            onClick={() => setForm(button.id)}>
            <Flex
              w="100%"
              h="100%"
              position="absolute"
              left="0"
              top="0"
              p="4"
              justifyContent="center"
              alignItems="center">
              <Text fontSize="2xl" textAlign="center">
                {button.title}
              </Text>
            </Flex>
          </Box>
        ));
    }
  }, [form]);

  return (
    <>
      <Button onClick={onOpen}>{t('Add repository')}</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setForm(undefined);
        }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir={{ base: 'column', md: 'row' }}>
            {renderForm()}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddRepoButton;
