import {
  IconButton,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { IoLanguageOutline } from 'react-icons/io5';

const LanguageSelector = ({ onChange }: { onChange?: () => void }) => {
  const { i18n, t } = useTranslation();

  return (
    <Menu autoSelect={false}>
      <MenuButton
        as={IconButton}
        aria-label="language selector"
        icon={<Icon as={IoLanguageOutline}></Icon>}
      />
      <MenuList>
        {['en', 'zh'].map((language) => (
          <MenuItem
            data-e2e-id="language-selector-option"
            position="relative"
            _before={{
              content: '""',
              display: language === i18n.language ? 'block' : 'none',
              position: 'absolute',
              w: '100%',
              h: '100%',
              bg: 'text--selected',
              left: 0,
              top: 0
            }}
            _hover={{
              _before: { display: 'block' },
              backgroundColor: 'inherit'
            }}
            key={language}
            onClick={() => {
              i18n.changeLanguage(language);
              onChange?.();
            }}>
            <Text zIndex={1}>{t(language)}</Text>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default LanguageSelector;
