import { extendTheme, withDefaultColorScheme } from '@chakra-ui/react';

const theme = extendTheme(
  {
    components: {
      Spinner: {
        baseStyle: { color: 'blue.500' },
        defaultProps: { size: 'xl', thickness: '4px' }
      },
      Radio: {
        parts: ['label'],
        baseStyle: {
          label: {
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }
        }
      }
    }
  },
  withDefaultColorScheme({
    colorScheme: 'blue',
    components: ['Button']
  })
);

export default theme;
