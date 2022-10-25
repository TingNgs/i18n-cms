import { PropsWithChildren } from 'react';

import {
  Button,
  ButtonGroup,
  Flex,
  Link as ChakraLink,
  Image,
  Text
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';

import AuthButton from '../AuthButton';
import LoadingModal from '../LoadingModal';
import { useAppSelector } from '../../redux/store';
import { isAuthSelector } from '../../redux/selector';
import LanguageSelector from '../LanguageSelector';

const AppLayout = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const authState = useAppSelector((state) => state.AppReducer.authState);
  useAuth();

  const isAuth = useAppSelector(isAuthSelector);

  if (authState === 'initial') {
    return <LoadingModal />;
  }

  return (
    <Flex direction="column" h="100%">
      {location.pathname !== '/repo' && (
        <Flex justifyContent="space-between" padding="2">
          <Link to="/">
            <Flex gap="2" alignItems="center">
              <Image w="10" h="10" src="/logo.svg" />
              <Text color="blue.500" fontWeight="bold">
                i18n cms
              </Text>
            </Flex>
          </Link>

          <ButtonGroup flexWrap="wrap" alignItems="center">
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
            {isAuth && location.pathname !== '/dashboard' && (
              <Link to="/dashboard">
                <Button variant="ghost">Get Started</Button>
              </Link>
            )}
            <LanguageSelector />
            <AuthButton />
          </ButtonGroup>
        </Flex>
      )}
      {children}
    </Flex>
  );
};

export default AppLayout;
