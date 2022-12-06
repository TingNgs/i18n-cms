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
import { SiGithub, SiBitbucket } from 'react-icons/si';

import OauthPopup from 'react-oauth-popup';
import { noop } from 'lodash-es';

import { isAuthSelector } from '../../redux/selector';
import {
  useLoginWithGithubMutation,
  useLoginWithBitbucketMutation,
  useLogoutMutation
} from '../../redux/services/authApi';
import { useAppSelector } from '../../redux/store';

const AuthButton = () => {
  const history = useHistory();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { t } = useTranslation();
  const [loginWithGithub] = useLoginWithGithubMutation();
  const [loginWithBitbucket, { isLoading: isBitbucketLoading }] =
    useLoginWithBitbucketMutation();
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
    async (code: string) => {
      await loginWithBitbucket({ code }).unwrap();
      onClose();
      history.push('/menu');
    },
    [loginWithBitbucket]
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
                url={`https://bitbucket.org/site/oauth2/authorize?client_id=${process.env.REACT_APP_BITBUCKET_KEY}&response_type=code`}>
                <Button
                  w="100%"
                  onClick={
                    window.Cypress
                      ? () => {
                          onCode('1234');
                        }
                      : undefined
                  }
                  data-e2e-id="bitbucket_login_button"
                  leftIcon={<SiBitbucket />}
                  isLoading={isBitbucketLoading}>
                  {t('Login with Bitbucket')}
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
