import {
  Button,
  Stack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  Text,
  PopoverBody,
  PopoverFooter,
  useDisclosure,
  Input,
  useBreakpointValue,
  Modal,
  ModalContent,
  ModalBody,
  ModalOverlay,
  ModalHeader,
  FormLabel,
  ModalCloseButton
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { SmallAddIcon } from '@chakra-ui/icons';

import { useAppDispatch } from '../../../redux/store';
import { useForm } from 'react-hook-form';
import { useCallback, useRef } from 'react';
import { addNewNamespace } from '../../../redux/editingRepoSlice';

const NewNamespaceBtn = ({
  onCloseSidebar,
  namespaces
}: {
  onCloseSidebar: () => void;
  namespaces: string[];
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isLg = useBreakpointValue(
    { base: false, lg: true },
    { fallback: 'md' }
  );
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<{
    namespace: string;
  }>();
  const { isOpen, onToggle, onClose } = useDisclosure();
  const { t } = useTranslation();
  const { t: repoT } = useTranslation('repo');

  const { ref: namespaceRef, ...namespaceRest } = register('namespace');

  const popoverInputRef = (e: HTMLInputElement) => {
    namespaceRef(e);
    inputRef.current = e;
  };

  const onSubmit = useCallback(
    handleSubmit((values) => {
      const { namespace } = values;
      if (namespaces.includes(namespace)) {
        setError('namespace', {
          message: repoT('Namespace already exist', { namespace })
        });
        return;
      }
      dispatch(addNewNamespace(namespace));
      onClose();
      onCloseSidebar();
    }),
    [namespaces, setError, onClose, onCloseSidebar]
  );

  return (
    <>
      <Popover
        isLazy
        placement="left"
        isOpen={isLg && isOpen}
        onClose={onClose}
        initialFocusRef={inputRef}>
        <PopoverTrigger>
          <Button
            variant="link"
            size="sm"
            alignSelf="flex-start"
            p={2}
            onClick={onToggle}>
            <SmallAddIcon />
            {repoT('New namespace')}
          </Button>
        </PopoverTrigger>

        <PopoverContent>
          <form onSubmit={onSubmit}>
            <PopoverArrow />
            <PopoverBody>
              <Stack>
                <FormLabel>{repoT('New namespace')}</FormLabel>
                <Input ref={popoverInputRef} {...namespaceRest} isRequired />
                {errors.namespace?.message && (
                  <Text color="red.500">{errors.namespace?.message}</Text>
                )}
              </Stack>
            </PopoverBody>
            <PopoverFooter>
              <Button size="sm" type="submit">
                {t('Create')}
              </Button>
            </PopoverFooter>
          </form>
        </PopoverContent>
      </Popover>
      <Modal isOpen={!isLg && isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>{repoT('New namespace')}</ModalHeader>
          <ModalBody>
            <form onSubmit={onSubmit}>
              <Stack>
                <FormLabel>{t('Namespace')}</FormLabel>
                <Input {...register('namespace')} isRequired autoFocus />
                {errors.namespace?.message && (
                  <Text color="red.500">{errors.namespace?.message}</Text>
                )}

                <Button type="submit">{t('Create')}</Button>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NewNamespaceBtn;
