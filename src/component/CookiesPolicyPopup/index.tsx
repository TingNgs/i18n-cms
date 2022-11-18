import { CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button,
  Text,
  Flex,
  useColorModeValue,
  useDisclosure,
  Portal,
  ButtonGroup,
  IconButton,
  Link
} from '@chakra-ui/react';

import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePageTracking from '../../hooks/usePageTracking';
import { getLocalStorage, setLocalStorage } from '../../utils/storage';

const CookiesPolicyPopup = () => {
  const { t } = useTranslation();
  const { isOpen, onClose } = useDisclosure({
    defaultIsOpen: !getLocalStorage('isCookiesAccepted')
  });
  const [isCookiesAccepted, setAccepted] = useState(
    !!getLocalStorage('isCookiesAccepted')
  );

  usePageTracking({ isCookiesAccepted });

  const onConfirm = () => {
    setAccepted(true);
    setLocalStorage('isCookiesAccepted', 'true');
    onClose();
  };

  return isOpen ? (
    <Portal>
      <Flex
        data-e2e-id="cookies_banner"
        position="fixed"
        bottom="0"
        m="0"
        w="100%"
        maxW="auto"
        padding="4"
        zIndex={1}
        boxShadow="var(--chakra-shadows-dark-lg)"
        backgroundColor="var(--chakra-colors-chakra-body-bg)"
        justifyContent="center"
        _before={{
          content: '""',
          display: useColorModeValue('none', 'block'),
          position: 'absolute',
          w: '100%',
          h: '100%',
          bg: 'var(--chakra-colors-chakra-body-text)',
          opacity: '0.1',
          left: 0,
          top: 0,
          zIndex: -1
        }}>
        <Flex gap="4" justifyContent="center" alignItems="center">
          <Flex flexDir="column">
            <Text fontWeight="semibold">
              {t('This website uses cookies to improve user experience')}
            </Text>
            <Link
              href={process.env.REACT_APP_COOKIES_POLICY}
              fontSize="sm"
              alignSelf="flex-start"
              alignItems="center"
              display="flex"
              gap="1"
              isExternal>
              {t('Learn more')}
              <ExternalLinkIcon />
            </Link>
          </Flex>
          <ButtonGroup
            size="sm"
            alignItems={{ base: 'flex-end', md: 'center' }}
            justifyContent="space-between"
            flexDirection={{ base: 'column-reverse', md: 'row' }}
            gap="4">
            <Button onClick={onConfirm} data-e2e-id="cookies_accept_button">
              {t('Accept')}
            </Button>
            <IconButton
              variant="ghost"
              size="xs"
              onClick={onClose}
              icon={<CloseIcon />}
              aria-label="close cookies policy button"
              data-e2e-id="cookies_cancel_button"
            />
          </ButtonGroup>
        </Flex>
      </Flex>
    </Portal>
  ) : null;
};

export default memo(CookiesPolicyPopup);
