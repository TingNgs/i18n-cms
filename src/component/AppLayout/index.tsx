import { PropsWithChildren, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';
import { isAuthSelector } from '../../redux/selector';
import {
  useLoginMutation,
  useLogoutMutation
} from '../../redux/services/authApi';
import { useAppSelector } from '../../redux/store';
import LoadingModal from '../LoadingModal';

const AppLayout = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

  useAuth();

  const isAuth = useAppSelector(isAuthSelector);
  const authState = useAppSelector((state) => state.AppReducer.authState);

  const onLoginClicked = useCallback(async () => {
    await login(undefined).unwrap();
    navigate('/dashboard');
  }, [login]);

  const onLogoutClicked = useCallback(() => {
    logout(undefined);
    navigate('/');
  }, [logout]);

  if (isLoginLoading || isLogoutLoading || authState === 'initial') {
    return <LoadingModal />;
  }

  return (
    <Flex direction="column" h="100%">
      <Flex align="flex-end" justifyContent="flex-end" padding="4">
        {isAuth ? (
          <Button onClick={onLogoutClicked}>{t('Logout')}</Button>
        ) : (
          <Button onClick={onLoginClicked}>{t('Login with Github')}</Button>
        )}
      </Flex>

      {children}
    </Flex>
  );
};

export default AppLayout;
