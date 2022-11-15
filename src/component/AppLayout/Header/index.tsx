import { HamburgerIcon } from '@chakra-ui/icons';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ButtonGroup,
  Flex,
  Link as ChakraLink,
  Text,
  useBreakpointValue,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Stack,
  Icon
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { AiOutlineGithub } from 'react-icons/ai';

import LanguageSelector from '../../LanguageSelector';
import AuthButton from '../../AuthButton';
import ColorModeBtn from '../../ColorModeBtn';
import LogoIcon from './LogoIcon';

import { useAppSelector } from '../../../redux/store';
import { isAuthSelector } from '../../../redux/selector';

const Header = () => {
  const { t } = useTranslation();
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isAuth = useAppSelector(isAuthSelector);

  useEffect(() => {
    onClose();
  }, [isAuth]);

  return (
    <Flex
      justifyContent="space-between"
      padding="var(--chakra-space-3) var(--chakra-space-4)">
      <Link to="/">
        <Flex gap="2" alignItems="center" p="4px 0">
          <LogoIcon w="8" h="8" />
          <Text fontWeight="bold">i18n cms</Text>
        </Flex>
      </Link>

      {isDesktop ? (
        <ButtonGroup flexWrap="wrap" alignItems="center">
          {isAuth && (
            <ChakraLink as={Link} variant="link" to="/menu">
              {t('Menu')}
            </ChakraLink>
          )}
          <ChakraLink
            variant="link"
            href={process.env.REACT_APP_DOC_URL}
            isExternal>
            {t('Documentation')}
          </ChakraLink>
          <ChakraLink
            aria-label="18n-cms github repository"
            variant="link"
            href={process.env.REACT_APP_GITHUB_URL}
            isExternal>
            <Icon as={AiOutlineGithub} w="6" h="6" />
          </ChakraLink>
          <LanguageSelector />
          <ColorModeBtn />
          <AuthButton />
        </ButtonGroup>
      ) : (
        <IconButton
          aria-label="drawer"
          icon={<HamburgerIcon />}
          variant="link"
          onClick={onOpen}
        />
      )}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader></DrawerHeader>
          <DrawerBody>
            <Stack spacing={5} paddingTop="5">
              <AuthButton />
              <ChakraLink as={Link} variant="link" to="/" onClick={onClose}>
                {t('Home')}
              </ChakraLink>
              {isAuth && (
                <ChakraLink
                  as={Link}
                  variant="link"
                  to="/menu"
                  onClick={onClose}>
                  {t('Menu')}
                </ChakraLink>
              )}
              <ChakraLink
                p="0 12px"
                variant="link"
                href={process.env.REACT_APP_DOC_URL}
                isExternal
                onClick={onClose}>
                {t('Documentation')}
              </ChakraLink>
            </Stack>
          </DrawerBody>

          <DrawerFooter justifyContent={'space-between'} alignItems="center">
            <ChakraLink
              variant="link"
              aria-label="18n-cms github repository"
              href={process.env.REACT_APP_GITHUB_URL}
              isExternal>
              <Icon as={AiOutlineGithub} w="6" h="6" />
            </ChakraLink>
            <Flex gap={2}>
              <LanguageSelector onChange={onClose} />
              <ColorModeBtn />
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default Header;
