import { useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Stack,
  Link,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../redux/store';

import Namespace from './Namespace';
import { ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import NewItemBtn from './NewItemBtn';
import {
  addNewNamespace,
  addNewLanguage
} from '../../../redux/editingRepoSlice';

import LanguageList from './LanguageList';
import LanguageSelector from '../../../component/LanguageSelector';
import { getGithubBranchUrl, getGithubUrl } from '../../../utils';
import ColorModeBtn from '../../../component/ColorModeBtn';
import Container from './Container';

const TITLE_PROPS = {
  fontWeight: 'bold'
};

const SUB_TITLE_PROPS = {
  fontWeight: 'bold',
  fontSize: '0.8rem'
};

const Sidebar = ({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const { t: repoT } = useTranslation('repo');
  const dispatch = useAppDispatch();
  const { namespaces, selectedNamespace, editingRepo, branch, languages } =
    useAppSelector((state) => state.EditingRepoReducer);

  const onAddNewNamespace = useCallback((value: string) => {
    dispatch(addNewNamespace(value));
  }, []);

  const onAddNewLanguage = useCallback((value: string) => {
    dispatch(addNewLanguage(value));
  }, []);

  if (!editingRepo || !branch) return null;

  const githubLink = getGithubUrl(editingRepo);
  const branchLink = getGithubBranchUrl(editingRepo, branch);

  return (
    <Container isOpen={isOpen} onClose={onClose}>
      <Stack w="100%" spacing="3" flex="1" position="relative">
        <Link
          as={RouterLink}
          to="/menu"
          p="4"
          display="flex"
          alignItems="center"
          alignSelf="flex-start"
          gap={2}
          fontWeight="semibold">
          <ArrowBackIcon rotate={180} />
          {t('Back to menu')}
        </Link>

        <Accordion allowMultiple defaultIndex={[1]}>
          <AccordionItem>
            <AccordionButton justifyContent="space-between">
              <Text {...TITLE_PROPS}>{t('Repository')}</Text>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Stack>
                <Text {...SUB_TITLE_PROPS}>{t('Repository')}</Text>
                <Link isExternal href={githubLink}>
                  <ExternalLinkIcon marginBottom={1} /> {editingRepo?.fullName}
                </Link>

                <Text {...SUB_TITLE_PROPS}>{t('Branch')}</Text>
                <Link isExternal href={branchLink}>
                  <ExternalLinkIcon marginBottom={1} /> {branch}
                </Link>
              </Stack>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton justifyContent="space-between">
              <Text {...TITLE_PROPS}>{t('Namespaces')}</Text>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel padding={0}>
              {namespaces.map((namespace) => (
                <Namespace
                  key={namespace}
                  namespace={namespace}
                  isSelected={namespace === selectedNamespace}
                  onCloseSidebar={onClose}
                />
              ))}
              <NewItemBtn
                addItemHandler={onAddNewNamespace}
                onCloseSidebar={onClose}
                items={namespaces}
                duplicatedErrMsg={repoT('Namespace already exist')}
                title={repoT('New namespace')}
                itemName={t('Namespace')}
              />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton justifyContent="space-between">
              <Text {...TITLE_PROPS}>{t('Languages')}</Text>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel padding={0}>
              <LanguageList />
              <NewItemBtn
                addItemHandler={onAddNewLanguage}
                items={languages}
                duplicatedErrMsg={repoT('Language already exist')}
                title={repoT('New language')}
                itemName={t('Language')}
              />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        <Flex p="4" gap={2} flex={1} alignItems="flex-end" flexDir="row">
          <ColorModeBtn />
          <LanguageSelector />
        </Flex>
      </Stack>
    </Container>
  );
};

export default Sidebar;
