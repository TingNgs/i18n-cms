import { DeleteIcon } from '@chakra-ui/icons';
import {
  ButtonGroup,
  Button,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  Portal,
  Text,
  PopoverBody,
  PopoverFooter,
  useDisclosure,
  useBreakpointValue
} from '@chakra-ui/react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from '../../../../../component/DeleteModal';
import { removeLocaleOnIndex } from '../../../../../redux/editingRepoSlice';
import { useAppDispatch } from '../../../../../redux/store';

const DeleteBtn = ({
  localeKey,
  index
}: {
  localeId?: string;
  localeKey?: string;
  index?: number;
}) => {
  const isLg = useBreakpointValue({ base: false, lg: true });
  const dispatch = useAppDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const { t: repoT } = useTranslation('repo');

  const onDeleteBtnClicked = useCallback(() => {
    if (index === undefined) return;
    onClose();
    dispatch(removeLocaleOnIndex({ index }));
  }, [index]);

  return (
    <>
      <Popover
        placement="left"
        onOpen={onOpen}
        isOpen={isLg && isOpen}
        onClose={onClose}>
        <PopoverTrigger>
          <IconButton
            aria-label="more"
            icon={<DeleteIcon />}
            colorScheme="gray"
          />
        </PopoverTrigger>
        <Portal>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody>
              <Text
                dangerouslySetInnerHTML={{
                  __html: repoT('Delete key confirmation', {
                    localeKey
                  })
                }}
              />
            </PopoverBody>
            <PopoverFooter>
              <ButtonGroup size="sm">
                <Button variant="outline" onClick={onClose}>
                  {t('Cancel')}
                </Button>
                <Button colorScheme="red" onClick={onDeleteBtnClicked}>
                  {t('Delete')}
                </Button>
              </ButtonGroup>
            </PopoverFooter>
          </PopoverContent>
        </Portal>
      </Popover>

      <DeleteModal
        title={
          <Text
            dangerouslySetInnerHTML={{
              __html: repoT('Delete key', {
                localeKey
              })
            }}
          />
        }
        content={
          <Text
            dangerouslySetInnerHTML={{
              __html: repoT('Delete key confirmation', {
                localeKey
              })
            }}
          />
        }
        onClose={onClose}
        onConfirm={onDeleteBtnClicked}
        isOpen={isOpen && !isLg}
      />
    </>
  );
};

export default memo(DeleteBtn);
