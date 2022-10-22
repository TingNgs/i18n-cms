import { PropsWithChildren } from 'react';

import { Button, ButtonGroup, Flex } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';

import AuthButton from '../AuthButton';
import LoadingModal from '../LoadingModal';
import { useAppSelector } from '../../redux/store';
import { isAuthSelector } from '../../redux/selector';

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
        <Flex align="flex-end" justifyContent="flex-end" padding="2">
          <ButtonGroup>
            <a
              href={process.env.REACT_APP_DOC_URL}
              target="_blank"
              rel="noreferrer noopener">
              <Button variant="ghost">Doc</Button>
            </a>
            {isAuth && (
              <Link to="/dashboard">
                <Button variant="ghost">Get Started</Button>
              </Link>
            )}
            <AuthButton />
          </ButtonGroup>
        </Flex>
      )}
      {children}
    </Flex>
  );
};

export default AppLayout;
