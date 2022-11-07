import { IconButton, useColorMode } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

const ColorModeBtn = () => {
  const mode = useColorMode();

  return (
    <IconButton
      onClick={mode.toggleColorMode}
      icon={mode.colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
      aria-label="colorModeBtn"
    />
  );
};

export default ColorModeBtn;
