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
import { SmallAddIcon } from '@chakra-ui/icons';

import { useForm } from 'react-hook-form';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const NewItemBtn = ({
  addItemHandler,
  onCloseSidebar,
  items,
  duplicatedErrMsg,
  title,
  itemName
}: {
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
      onCloseSidebar?.();
    }),
    [items, setError, onClose, onCloseSidebar]
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
            {title}
          </Button>
        </PopoverTrigger>

        <PopoverContent>
          <form onSubmit={onSubmit}>
            <PopoverArrow />
            <PopoverBody>
              <Stack>
                <FormLabel>{title}</FormLabel>
                <Input ref={popoverInputRef} {...itemRest} isRequired />
                {errors.item?.message && (
                  <Text color="red.500">{errors.item?.message}</Text>
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
          <ModalHeader>{title}</ModalHeader>
          <ModalBody>
            <form onSubmit={onSubmit}>
              <Stack>
                <FormLabel>{itemName}</FormLabel>
                <Input {...register('item')} isRequired autoFocus />
                {errors.item?.message && (
                  <Text color="red.500">{errors.item?.message}</Text>
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

export default NewItemBtn;
