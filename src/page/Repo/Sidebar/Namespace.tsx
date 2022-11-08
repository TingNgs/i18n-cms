import { Text, Flex, Tooltip, useBreakpointValue } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedNamespaces } from '../../../redux/editingRepoSlice';
import { duplicatedKeySelector } from '../../../redux/selector';
import { useAppSelector } from '../../../redux/store';
import { useTranslation } from 'react-i18next';

const Namespaces = ({
  namespace,
  isSelected,
  onCloseSidebar
}: {
  namespace: string;
  isSelected: boolean;
  onCloseSidebar: () => void;
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { t } = useTranslation('repo');
  const dispatch = useDispatch();
  const onClick = useCallback(() => {
    dispatch(setSelectedNamespaces(namespace));
    if (isMobile) onCloseSidebar();
  }, [namespace, onCloseSidebar, isMobile]);

  const isNsContainsDuplicatedKeys = useAppSelector(
    (state) => Object.keys(duplicatedKeySelector(state, namespace)).length > 0
  );

  return (
    <Flex
      onClick={onClick}
      p={'8px 16px'}
      fontWeight={isSelected ? 'semibold' : undefined}
      cursor="pointer"
      alignItems={'center'}
      position="relative"
      _before={{
        content: '""',
        display: isSelected ? 'block' : 'none',
        position: 'absolute',
        w: '100%',
        h: '100%',
        bg: 'var(--chakra-colors-chakra-body-text)',
        opacity: '0.1',
        left: 0,
        top: 0,
        zIndex: -1
      }}
      _hover={{ _before: { display: 'block' } }}>
      <Text opacity={isSelected ? 1 : 0.7} flex="1">
        {namespace}
      </Text>
      {isNsContainsDuplicatedKeys && (
        <Tooltip
          hasArrow
          label={t('With duplicated keys')}
          backgroundColor="error">
          <WarningIcon w="4" h="4" color="error" />
        </Tooltip>
      )}
    </Flex>
  );
};

export default memo(Namespaces);
