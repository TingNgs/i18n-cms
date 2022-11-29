import { memo, MouseEventHandler, useCallback, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { pickBy } from 'lodash-es';
import {
  Stack,
  Link,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  IconButton,
  useBreakpointValue
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  ExternalLinkIcon,
  ViewIcon,
  ViewOffIcon
} from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../../redux/store';
import {
  addNewNamespace,
  addNewLanguage,
  setAllLanguageSelected
} from '../../../redux/editingRepoSlice';

import Namespace from './Namespace';
import NewItemBtn from './NewItemBtn';
import LanguageList from './LanguageList';
import LanguageSelector from '../../../component/LanguageSelector';
import ColorModeBtn from '../../../component/ColorModeBtn';
import Container from './Container';

import { getBranchUrl, getGithubUrl } from '../../../utils';

const TITLE_PROPS = {
  fontWeight: 'bold',
  flex: 1,
  textAlign: 'left'
} as const;

const SUB_TITLE_PROPS = {
  fontWeight: 'bold',
  fontSize: '0.8rem'
} as const;

const ACCORDION_ICON_PROPS = {
  w: '8',
  h: '8',
  p: '1.5'
} as const;

const ACCORDION_BTN_PROPS = {
  paddingRight: '0',
  position: 'sticky',
  top: 0,
  zIndex: 1,
  backgroundColor: {
    base: 'var(--drawer-bg)',
    md: 'var(--chakra-colors-chakra-body-bg)'
  },
  _hover: {
    backgroundColor: {
      base: 'var(--drawer-bg)',
      md: 'var(--chakra-colors-chakra-body-bg)'
    }
  }
} as const;

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
  const {
    namespaces,
    selectedNamespace,
    editingRepo,
    branch,
    languages,
    selectedLanguagesMap
  } = useAppSelector((state) => state.EditingRepoReducer);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isAnyLanguageSelected = useMemo(
    () => Object.keys(pickBy(selectedLanguagesMap)).length > 0,
    [selectedLanguagesMap]
  );

  const onShowAllLanguageClicked: MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (event) => {
        event.stopPropagation();
        dispatch(setAllLanguageSelected({ value: !isAnyLanguageSelected }));
      },
      [isAnyLanguageSelected]
    );

  const onAddNewNamespace = useCallback((value: string) => {
    dispatch(addNewNamespace(value));
  }, []);

  const onAddNewLanguage = useCallback((value: string) => {
    dispatch(addNewLanguage(value));
  }, []);

  if (!editingRepo || !branch) return null;

  const githubLink = getGithubUrl(editingRepo);
  const branchLink = getBranchUrl(editingRepo, branch);

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

        <Accordion allowMultiple defaultIndex={[1]} flex={1}>
          <AccordionItem>
            <AccordionButton
              {...ACCORDION_BTN_PROPS}
              data-e2e-id="repository_accordion_button">
              <Text {...TITLE_PROPS}>{t('Repository')}</Text>
              <AccordionIcon {...ACCORDION_ICON_PROPS} />
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
            <AccordionButton
              {...ACCORDION_BTN_PROPS}
              data-e2e-id="namespaces_accordion_button">
              <Text {...TITLE_PROPS}>{t('Namespaces')}</Text>
              <AccordionIcon {...ACCORDION_ICON_PROPS} />
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
                e2eTitle="namespace"
                addItemHandler={onAddNewNamespace}
                onCloseSidebar={onClose}
                items={namespaces}
                duplicatedErrMsg={repoT('Namespace already exist')}
                title={repoT('New namespace')}
                itemName={t('Namespace')}
              />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem position="relative">
            <Flex {...ACCORDION_BTN_PROPS}>
              <AccordionButton
                {...ACCORDION_BTN_PROPS}
                data-e2e-id="languages_accordion_button">
                <Text {...TITLE_PROPS}>{t('Languages')}</Text>
                <AccordionIcon {...ACCORDION_ICON_PROPS} />
              </AccordionButton>
              {!isMobile && (
                <IconButton
                  position="absolute"
                  right="8"
                  top="2"
                  variant="ghost"
                  aria-label="show all language"
                  data-visible={isAnyLanguageSelected}
                  size="sm"
                  zIndex={1}
                  icon={isAnyLanguageSelected ? <ViewIcon /> : <ViewOffIcon />}
                  onClick={onShowAllLanguageClicked}
                />
              )}
            </Flex>

            <AccordionPanel padding={0}>
              <LanguageList />
              <NewItemBtn
                e2eTitle="language"
                addItemHandler={onAddNewLanguage}
                items={languages}
                duplicatedErrMsg={repoT('Language already exist')}
                title={repoT('New language')}
                itemName={t('Language')}
              />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        <Flex p="4" gap={2} alignItems="flex-end" flexDir="row">
          <ColorModeBtn />
          <LanguageSelector />
        </Flex>
      </Stack>
    </Container>
  );
};

export default memo(Sidebar);
