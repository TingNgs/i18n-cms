import { PropsWithChildren } from 'react';

import { Flex } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';

import LoadingModal from '../LoadingModal';
import Header from './Header';
import { useAppSelector } from '../../redux/store';

const AppLayout = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const authState = useAppSelector((state) => state.AppReducer.authState);
  useAuth();

  if (authState === 'initial') {
    return <LoadingModal />;
  }

  return (
    <Flex direction="column" h="100%">
      {location.pathname !== '/repo' && <Header />}
      {children}
    </Flex>
  );
};

export default AppLayout;
