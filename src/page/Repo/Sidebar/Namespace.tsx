import { Text, Flex, Tooltip, useBreakpointValue } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setSelectedNamespaces } from '../../../redux/editingRepoSlice';
import {
  duplicatedKeysSelectorFactory,
  duplicatedKeysSelectorMap
} from '../../../redux/selector';
import { useAppSelector } from '../../../redux/store';

const Namespace = ({
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

  const duplicatedKeysSelector = useMemo(() => {
    if (!duplicatedKeysSelectorMap[namespace])
      duplicatedKeysSelectorMap[namespace] =
        duplicatedKeysSelectorFactory(namespace);
    return duplicatedKeysSelectorMap[namespace];
  }, [namespace]);

  const duplicatedKeys = useAppSelector((state) =>
    duplicatedKeysSelector(state)
  );

  return (
    <Flex
      data-e2e-id="namespace"
      aria-selected={isSelected}
      onClick={onClick}
      p="4px 16px"
      minHeight="40px"
      fontWeight={isSelected ? 'semibold' : undefined}
      cursor="pointer"
      alignItems="center"
      position="relative"
      _before={{
        content: '""',
        display: isSelected ? 'block' : 'none',
        position: 'absolute',
        w: '100%',
        h: '100%',
        bg: 'text--selected',
        left: 0,
        top: 0,
        zIndex: -1
      }}
      _hover={{ _before: { display: 'block' } }}>
      <Text opacity={isSelected ? 1 : 0.7} flex="1">
        {namespace}
      </Text>
      <Flex gap="2" alignItems="center">
        {Object.keys(duplicatedKeys).length > 0 && (
          <Tooltip
            hasArrow
            label={t('With duplicated keys')}
            backgroundColor="error">
            <WarningIcon w="4" h="4" color="error" />
          </Tooltip>
        )}
      </Flex>
    </Flex>
  );
};

export default memo(Namespace);
