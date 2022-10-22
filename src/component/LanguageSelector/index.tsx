import {
  IconButton,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList
} from '@chakra-ui/react';
import { HiLanguage } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  return (
    <Menu>
      <MenuButton>
        <IconButton
          aria-label="language-selector"
          icon={<Icon as={HiLanguage} color="white" />}></IconButton>
      </MenuButton>
      <MenuList>
        {['en', 'zh'].map((language) => (
          <MenuItem
            key={language}
            onClick={() => i18n.changeLanguage(language)}>
            {t(language)}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default LanguageSelector;
