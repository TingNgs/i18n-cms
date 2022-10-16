import { Text, Flex, Tooltip } from '@chakra-ui/react';
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
  const { t } = useTranslation('repo');
  const dispatch = useDispatch();
  const onClick = useCallback(() => {
    dispatch(setSelectedNamespaces(namespace));
    onCloseSidebar();
  }, [namespace, onCloseSidebar]);

  const isNsContainsDuplicatedKeys = useAppSelector(
    (state) => Object.keys(duplicatedKeySelector(state, namespace)).length > 0
  );

  return (
    <Flex
      onClick={onClick}
      p={'8px 16px'}
      backgroundColor={isSelected ? 'blue.500' : undefined}
      cursor="pointer"
      alignItems={'center'}>
      <Text color={isSelected ? 'white' : 'blue.500'} flex="1">
        {namespace}
      </Text>
      {isNsContainsDuplicatedKeys && (
        <Tooltip
          hasArrow
          label={t('With duplicated keys')}
          backgroundColor={'red.500'}>
          <WarningIcon w="4" h="4" color={isSelected ? 'white' : 'red.500'} />
        </Tooltip>
      )}
    </Flex>
  );
};

export default memo(Namespaces);
