import { memo, useCallback } from 'react';

import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useBoolean
} from '@chakra-ui/react';
import { ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';

import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import DeleteModal from '../../../../component/DeleteModal';
import { useTranslation } from 'react-i18next';
import { removeNamespace } from '../../../../redux/editingRepoSlice';

const ActionBtn = ({
  setSidebarOpen
}: {
  setSidebarOpen: { on: () => void };
}) => {
  const { t: repoT } = useTranslation('repo');
  const dispatch = useAppDispatch();
  const [isDeleteModalOpen, setDeleteModalOpen] = useBoolean();

  const namespace = useAppSelector(
    (state) => state.EditingRepoReducer.selectedNamespace
  );

  const onDeleteNamespaceClicked = useCallback(() => {
    if (!namespace) return;
    dispatch(removeNamespace(namespace));
    setDeleteModalOpen.off();
    setSidebarOpen.on();
  }, [namespace, setDeleteModalOpen, setSidebarOpen]);

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="namespace actions"
          icon={<ChevronDownIcon />}
          disabled={!namespace}
        />
        <MenuList>
          <MenuItem
            data-e2e-id="delete_namespace_button"
            gap={2}
            onClick={setDeleteModalOpen.on}>
            <DeleteIcon color="gray.400" />
            <Text
              dangerouslySetInnerHTML={{
                __html: repoT('Delete namespace', { namespace })
              }}
            />
          </MenuItem>
        </MenuList>
      </Menu>
      {isDeleteModalOpen && (
        <DeleteModal
          title={
            <Text
              dangerouslySetInnerHTML={{
                __html: repoT('Delete namespace', { namespace })
              }}
            />
          }
          content={
            <Text
              dangerouslySetInnerHTML={{
                __html: repoT('Delete namespace confirmation', { namespace })
              }}
            />
          }
          isOpen={isDeleteModalOpen}
          onClose={setDeleteModalOpen.off}
          onConfirm={onDeleteNamespaceClicked}
        />
      )}
    </>
  );
};

export default memo(ActionBtn);
