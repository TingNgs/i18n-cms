import {
  Button,
  Stack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
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
  ModalCloseButton,
  Portal,
  FormControl,
  FormErrorMessage
} from '@chakra-ui/react';
import { SmallAddIcon } from '@chakra-ui/icons';

import { useForm } from 'react-hook-form';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from '@hookform/error-message';

const NewItemBtn = ({
  e2eTitle,
  addItemHandler,
  onCloseSidebar,
  items,
  duplicatedErrMsg,
  title,
  itemName
}: {
  e2eTitle: string;
  addItemHandler: (item: string) => void;
  onCloseSidebar?: () => void;
  items: string[];
  duplicatedErrMsg: string;
  title: string;
  itemName: string;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isLg = useBreakpointValue(
    { base: false, lg: true },
    { fallback: 'md' }
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    setValue
  } = useForm<{
    item: string;
  }>();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { t } = useTranslation();
  const { isOpen, onToggle, onClose } = useDisclosure();

  const { ref: itemRef, ...itemRest } = register('item');

  const popoverInputRef = (e: HTMLInputElement) => {
    itemRef(e);
    inputRef.current = e;
  };

  const onSubmit = useCallback(
    handleSubmit((values) => {
      const { item } = values;
      if (items.includes(item)) {
        setError('item', {
          message: duplicatedErrMsg
        });
        return;
      }
      addItemHandler(item);
      setValue('item', '');
      onClose();
      if (isMobile) {
        onCloseSidebar?.();
      }
    }),
    [items, isMobile, setError, onClose, onCloseSidebar]
  );

  return (
    <>
      <Popover
        isLazy
        isOpen={isLg && isOpen}
        onClose={onClose}
        initialFocusRef={inputRef}>
        <PopoverTrigger>
          <Button
            data-e2e-id={`new_${e2eTitle}_button`}
            variant="link"
            size="sm"
            alignSelf="flex-start"
            p={2}
            onClick={onToggle}>
            <SmallAddIcon />
            {title}
          </Button>
        </PopoverTrigger>
        <Portal>
          <PopoverContent>
            <form onSubmit={onSubmit}>
              <PopoverArrow />
              <PopoverBody>
                <Stack>
                  <FormControl isRequired isInvalid={!!errors.item}>
                    <FormLabel>{title}</FormLabel>
                    <Input
                      ref={popoverInputRef}
                      {...itemRest}
                      data-e2e-id={`new_${e2eTitle}_input`}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="item"
                      as={FormErrorMessage}
                    />
                  </FormControl>
                </Stack>
              </PopoverBody>
              <PopoverFooter>
                <Button
                  size="sm"
                  type="submit"
                  data-e2e-id={`new_${e2eTitle}_submit`}>
                  {t('Create')}
                </Button>
              </PopoverFooter>
            </form>
          </PopoverContent>
        </Portal>
      </Popover>
      <Modal
        isOpen={!isLg && isOpen}
        onClose={onClose}
        motionPreset="none"
        blockScrollOnMount={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>{title}</ModalHeader>
          <ModalBody>
            <form onSubmit={onSubmit}>
              <Stack>
                <FormControl isRequired isInvalid={!!errors.item}>
                  <FormLabel>{itemName}</FormLabel>
                  <Input
                    {...register('item')}
                    autoFocus
                    data-e2e-id={`new_${e2eTitle}_input`}
                  />
                  <ErrorMessage
                    errors={errors}
                    name="item"
                    as={FormErrorMessage}
                  />
                </FormControl>

                <Button type="submit" data-e2e-id={`new_${e2eTitle}_submit`}>
                  {t('Create')}
                </Button>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NewItemBtn;
