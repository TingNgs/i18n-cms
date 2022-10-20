import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';

import { isAuthSelector } from '../../redux/selector';
import {
  useLoginMutation,
  useLogoutMutation
} from '../../redux/services/authApi';
import { useAppSelector } from '../../redux/store';
import LoadingModal from '../LoadingModal';

const AuthButton = () => {
  const history = useHistory();

  const { t } = useTranslation();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

  const isAuth = useAppSelector(isAuthSelector);

  const onLoginClicked = useCallback(async () => {
    await login(undefined).unwrap();
    history.push('/dashboard');
  }, [login]);

  const onLogoutClicked = useCallback(() => {
    logout(undefined);
    history.push('/');
  }, [logout]);

  if (isLoginLoading || isLogoutLoading) {
    return <LoadingModal />;
  }

  return isAuth ? (
    <Button onClick={onLogoutClicked} variant="outline">
      {t('Logout')}
    </Button>
  ) : (
    <Button onClick={onLoginClicked}>{t('Login with Github')}</Button>
  );
};

export default AuthButton;
