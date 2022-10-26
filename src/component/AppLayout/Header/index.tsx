import {
  ButtonGroup,
  Flex,
  Link as ChakraLink,
  Image,
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
import { Link, useLocation } from 'react-router-dom';
import { AiOutlineGithub } from 'react-icons/ai';

import AuthButton from '../../AuthButton';

import { useAppSelector } from '../../../redux/store';
import { isAuthSelector } from '../../../redux/selector';
import LanguageSelector from '../../LanguageSelector';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useEffect } from 'react';

const Header = () => {
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isAuth = useAppSelector(isAuthSelector);

  useEffect(() => {
    onClose();
  }, [isAuth]);

  return (
    <Flex justifyContent="space-between" padding="2">
      <Link to="/">
        <Flex gap="2" alignItems="center" p="4px 0">
          <Image w="8" h="8" src="/logo.svg" />
          <Text color="blue.500" fontWeight="bold">
            i18n cms
          </Text>
        </Flex>
      </Link>

      {isDesktop ? (
        <ButtonGroup flexWrap="wrap" alignItems="center">
          {isAuth && location.pathname !== '/dashboard' && (
            <ChakraLink
              as={Link}
              p="0 12px"
              fontWeight="bold"
              color="blue.500"
              h="100%"
              display="flex"
              to="/dashboard"
              alignItems="center">
              Get Started
            </ChakraLink>
          )}
          <ChakraLink
            p="0 12px"
            fontWeight="bold"
            color="blue.500"
            h="100%"
            display="flex"
            alignItems="center"
            href={process.env.REACT_APP_DOC_URL}
            isExternal>
            Doc
          </ChakraLink>
          <ChakraLink
            p="0 12px"
            fontWeight="bold"
            color="blue.500"
            h="100%"
            display="flex"
            alignItems="center"
            href={process.env.REACT_APP_GITHUB_URL}
            isExternal>
            <Icon as={AiOutlineGithub} w="6" h="6" />
          </ChakraLink>
          <AuthButton />
          <LanguageSelector />
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
              <ChakraLink
                as={Link}
                p="0 12px"
                fontWeight="bold"
                color="blue.500"
                h="100%"
                display="flex"
                to="/"
                alignItems="center"
                onClick={onClose}>
                Home
              </ChakraLink>
              {isAuth && (
                <ChakraLink
                  as={Link}
                  p="0 12px"
                  fontWeight="bold"
                  color="blue.500"
                  h="100%"
                  display="flex"
                  to="/dashboard"
                  alignItems="center"
                  onClick={onClose}>
                  Dashboard
                </ChakraLink>
              )}
              <ChakraLink
                p="0 12px"
                fontWeight="bold"
                color="blue.500"
                h="100%"
                display="flex"
                alignItems="center"
                href={process.env.REACT_APP_DOC_URL}
                isExternal
                onClick={onClose}>
                Doc
              </ChakraLink>
            </Stack>
          </DrawerBody>

          <DrawerFooter justifyContent={'space-between'} alignItems="center">
            <ChakraLink
              p="0 12px"
              fontWeight="bold"
              color="blue.500"
              h="100%"
              display="flex"
              alignItems="center"
              href={process.env.REACT_APP_GITHUB_URL}
              isExternal>
              <Icon as={AiOutlineGithub} w="6" h="6" />
            </ChakraLink>
            <LanguageSelector onChange={onClose} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default Header;
