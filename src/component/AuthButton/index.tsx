import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure
} from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import { SiGithub, SiBitbucket, SiGitlab } from 'react-icons/si';

import OauthPopup from 'react-oauth-popup';
import { noop } from 'lodash-es';

import { isAuthSelector } from '../../redux/selector';
import {
  useLoginWithGithubMutation,
  useLoginWithOauthMutation,
  useLogoutMutation
} from '../../redux/services/authApi';
import { useAppSelector } from '../../redux/store';

const AuthButton = () => {
  const history = useHistory();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { t } = useTranslation();
  const [loginWithGithub] = useLoginWithGithubMutation();
  const [loginWithOauth, { isLoading: isOathLoading }] =
    useLoginWithOauthMutation();
  const [logout] = useLogoutMutation();

  const isAuth = useAppSelector(isAuthSelector);

  const onGithubLoginClick = useCallback(async () => {
    await loginWithGithub(undefined).unwrap();
    onClose();
    history.push('/menu');
  }, [loginWithGithub]);

  const onLogoutClicked = useCallback(() => {
    logout(undefined);
    history.push('/');
  }, [logout]);

  const onCode = useCallback(
    async (code: string, p: URLSearchParams) => {
      const data = Object.fromEntries(p) as Parameters<
        typeof loginWithOauth
      >[0];
      await loginWithOauth(data).unwrap();
      onClose();
      history.push('/menu');
    },
    [loginWithOauth]
  );

  return (
    <>
      {isAuth ? (
        <Button
          data-e2e-id="logout_button"
          onClick={onLogoutClicked}
          variant="outline">
          {t('Logout')}
        </Button>
      ) : (
        <Button data-e2e-id="login_button" onClick={onOpen}>
          {t('Login')}
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="xs">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center" />
          <ModalBody>
            <Stack>
              <Button
                data-e2e-id="github_login_button"
                onClick={onGithubLoginClick}
                leftIcon={<SiGithub />}>
                {t('Login with GitHub')}
              </Button>
              {/* @ts-ignore */}
              <OauthPopup
                onCode={onCode}
                onClose={noop}
                url={`${process.env.REACT_APP_FUNCTIONS_URL}bitbucket/auth?redirectUrl=${window.location}`}>
                <Button
                  w="100%"
                  onClick={
                    window.Cypress
                      ? () => {
                          onCode(
                            '1234',
                            new URLSearchParams(
                              'access_token=asd&expires_in=7200&refresh_token=mock_refresh_token&token=token'
                            )
                          );
                        }
                      : undefined
                  }
                  data-e2e-id="bitbucket_login_button"
                  leftIcon={<SiBitbucket />}
                  isLoading={isOathLoading}>
                  {t('Login with Bitbucket')}
                </Button>
              </OauthPopup>
              {/* @ts-ignore */}
              <OauthPopup
                onCode={onCode}
                onClose={noop}
                url={`${process.env.REACT_APP_FUNCTIONS_URL}gitlab/auth?redirectUrl=${window.location}`}>
                <Button
                  w="100%"
                  onClick={
                    window.Cypress
                      ? () => {
                          onCode(
                            '1234',
                            new URLSearchParams(
                              'access_token=asd&expires_in=7200&refresh_token=mock_refresh_token&token=token'
                            )
                          );
                        }
                      : undefined
                  }
                  data-e2e-id="gitlab_login_button"
                  leftIcon={<SiGitlab />}
                  isLoading={isOathLoading}>
                  {t('Login with Gitlab')}
                </Button>
              </OauthPopup>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AuthButton;
