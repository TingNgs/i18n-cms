import { DeleteIcon } from '@chakra-ui/icons';
import {
  ButtonGroup,
  Button,
  Flex,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  Portal,
  Text,
  PopoverBody,
  PopoverFooter,
  useDisclosure
} from '@chakra-ui/react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { removeLocaleOnIndex } from '../../../redux/editingRepoSlice';
import { useAppDispatch } from '../../../redux/store';
import { CELL_PROPS } from '../constants';

const EditButton = ({
  localeId,
  localeKey,
  index
}: {
  localeId?: string;
  localeKey?: string;
  index?: number;
}) => {
  const dispatch = useAppDispatch();
  const {
    isOpen: isDeletePopoverOpen,
    onOpen: onDeletePopoverOpen,
    onClose: onDeletePopoverClose
  } = useDisclosure();
  const { t } = useTranslation();
  const { t: repoT } = useTranslation('repo');

  const onDeleteBtnClicked = useCallback(() => {
    if (index === undefined) return;
    onDeletePopoverClose();
    dispatch(removeLocaleOnIndex({ index }));
  }, [index]);

  return (
    <Flex
      {...CELL_PROPS}
      flex="none"
      flexShrink={0}
      minWidth="0"
      position={'sticky'}
      right="0">
      <ButtonGroup
        isAttached
        size="sm"
        visibility={localeId ? 'visible' : 'hidden'}
        pointerEvents={localeId ? 'initial' : 'none'}>
        <Popover
          placement="left"
          onOpen={onDeletePopoverOpen}
          isOpen={isDeletePopoverOpen}
          onClose={onDeletePopoverClose}>
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
                    __html: repoT('Delete confirmation', {
                      localeKey
                    })
                  }}
                />
              </PopoverBody>
              <PopoverFooter>
                <ButtonGroup size="sm">
                  <Button variant="outline" onClick={onDeletePopoverClose}>
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
      </ButtonGroup>
    </Flex>
  );
};

export default memo(EditButton);
