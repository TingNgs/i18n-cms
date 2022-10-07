import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  useDisclosure,
  Flex
} from '@chakra-ui/react';
import CreateNewRepoForm from './CreateNewRepoForm';
import ImportGithubRepoForm from './ImportGithubRepoForm';

const FORM_LIST = [
  { Component: CreateNewRepoForm, titleKey: '' },
  { Component: ImportGithubRepoForm }
];

const AddRepoButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir={{ base: 'column', md: 'row' }}>
            {FORM_LIST.map(({ Component }, index) => (
              <Flex
                key={index}
                p="4"
                flexDir="column"
                alignItems="flex-start"
                w={{ base: '100%', md: '50%' }}
                {...(index === 0
                  ? {
                      borderRightWidth: { base: '0px', md: '1px' },
                      borderBottomWidth: { base: '1px', md: '0px' },
                      borderColor: 'blue.200'
                    }
                  : {})}>
                <Component />
              </Flex>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddRepoButton;
