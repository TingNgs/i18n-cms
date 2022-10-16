import { Link as RouterLink } from 'react-router-dom';
import { Flex, Stack, Link, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../redux/store';
import { SIDEBAR_WIDTH } from '../constants';
import Namespace from './Namespace';
import { ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import NewNamespaceBtn from './NewNamespaceBtn';

const TITLE_PROPS = {
  fontWeight: 'bold',
  fontSize: '0.8rem',
  marginBottom: '0.5'
};

const Sidebar = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const { namespaces, selectedNamespace, editingRepo, branch } = useAppSelector(
    (state) => state.EditingRepoReducer
  );

  const githubLink = `https://github.com/${editingRepo?.fullName}`;
  const branchLink = `${githubLink}/tree/${branch}`;

  return (
    <Stack overflow="scroll" w={`${SIDEBAR_WIDTH}px`} spacing="3">
      <Link
        as={RouterLink}
        to="/dashboard"
        p="4"
        display="flex"
        alignItems="center"
        gap={2}>
        <ArrowBackIcon rotate={180} />
        {t('Back to dashboard')}
      </Link>
      <Flex flexDir="column" w="100%" p="0 16px">
        <Text {...TITLE_PROPS}>{t('Repository')}</Text>
        <Link isExternal href={githubLink}>
          <ExternalLinkIcon marginBottom={1} /> {editingRepo?.fullName}
        </Link>
      </Flex>
      <Flex flexDir="column" w="100%" p="0 16px">
        <Text {...TITLE_PROPS}>{t('Branch')}</Text>
        <Link isExternal href={branchLink}>
          <ExternalLinkIcon marginBottom={1} /> {branch}
        </Link>
      </Flex>

      <Flex flexDir="column" w="100%">
        <Text {...TITLE_PROPS} p="0 16px">
          {t('Namespaces')}
        </Text>

        {namespaces.map((namespace) => (
          <Namespace
            key={namespace}
            namespace={namespace}
            isSelected={namespace === selectedNamespace}
            onCloseSidebar={onClose}
          />
        ))}
        <NewNamespaceBtn onCloseSidebar={onClose} namespaces={namespaces} />
      </Flex>
    </Stack>
  );
};

export default Sidebar;
