import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import { AiOutlineGithub } from 'react-icons/ai';

import { isAuthSelector } from '../../redux/selector';
import {
  useLoginMutation,
  useLogoutMutation
} from '../../redux/services/authApi';
import { useAppSelector } from '../../redux/store';

const AuthButton = () => {
  const history = useHistory();

  const { t } = useTranslation();
  const [login] = useLoginMutation();
  const [logout] = useLogoutMutation();

  const isAuth = useAppSelector(isAuthSelector);

  const onLoginClicked = useCallback(async () => {
    await login(undefined).unwrap();
    history.push('/dashboard');
  }, [login]);

  const onLogoutClicked = useCallback(() => {
    logout(undefined);
    history.push('/');
  }, [logout]);

  return isAuth ? (
    <Button onClick={onLogoutClicked} variant="outline">
      {t('Logout')}
    </Button>
  ) : (
    <Button onClick={onLoginClicked} leftIcon={<AiOutlineGithub />}>
      {t('Login with GitHub')}
    </Button>
  );
};

export default AuthButton;
