import {
  IconButton,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { HiLanguage } from 'react-icons/hi2';

const LanguageSelector = ({ onChange }: { onChange?: () => void }) => {
  const { i18n, t } = useTranslation();

  return (
    <Menu autoSelect={false}>
      <MenuButton
        as={IconButton}
        aria-label="language-selector"
        icon={<Icon color="white" as={HiLanguage}></Icon>}
      />
      <MenuList>
        {['en', 'zh'].map((language) => (
          <MenuItem
            backgroundColor={
              language === i18n.language ? 'blue.500' : undefined
            }
            color={language === i18n.language ? 'white' : undefined}
            _hover={{
              backgroundColor:
                language === i18n.language ? 'blue.500' : undefined
            }}
            key={language}
            onClick={() => {
              i18n.changeLanguage(language);
              onChange?.();
            }}>
            {t(language)}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default LanguageSelector;
