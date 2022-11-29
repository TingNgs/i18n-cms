import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Flex } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import { AiOutlineGithub } from 'react-icons/ai';
import OauthPopup from 'react-oauth-popup';
import { noop } from 'lodash-es';

import { isAuthSelector } from '../../redux/selector';
import {
  useLoginWithGithubMutation,
  useLoginWithBitbucketMutation,
  useLogoutMutation
} from '../../redux/services/authApi';
import { useAppSelector } from '../../redux/store';

const SHOW_BITBUCKET = false;

const AuthButton = () => {
  const history = useHistory();

  const { t } = useTranslation();
  const [loginWithGithub] = useLoginWithGithubMutation();
  const [loginWithBitbucket, { isLoading: isBitbucketLoading }] =
    useLoginWithBitbucketMutation();
  const [logout] = useLogoutMutation();

  const isAuth = useAppSelector(isAuthSelector);

  const onGithubLoginClick = useCallback(async () => {
    await loginWithGithub(undefined).unwrap();
    history.push('/menu');
  }, [loginWithGithub]);

  const onLogoutClicked = useCallback(() => {
    logout(undefined);
    history.push('/');
  }, [logout]);

  const onCode = useCallback(
    async (code: string) => {
      await loginWithBitbucket({ code }).unwrap();
      history.push('/menu');
    },
    [loginWithBitbucket]
  );

  return isAuth ? (
    <Button
      data-e2e-id="logout_button"
      onClick={onLogoutClicked}
      variant="outline">
      {t('Logout')}
    </Button>
  ) : (
    <Flex flexWrap="wrap">
      <Button
        data-e2e-id="github_login_button"
        onClick={onGithubLoginClick}
        leftIcon={<AiOutlineGithub />}>
        {t('Login with GitHub')}
      </Button>
      {SHOW_BITBUCKET && (
        /* @ts-ignore */
        <OauthPopup
          onCode={onCode}
          onClose={noop}
          url={`https://bitbucket.org/site/oauth2/authorize?client_id=${process.env.REACT_APP_BITBUCKET_KEY}&response_type=code`}>
          <Button
            data-e2e-id="bitbucket_login_button"
            isLoading={isBitbucketLoading}>
            {t('Login with Bitbucket')}
          </Button>
        </OauthPopup>
      )}
    </Flex>
  );
};

export default AuthButton;
