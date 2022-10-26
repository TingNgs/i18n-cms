import {
  extendTheme,
  withDefaultColorScheme,
  defineStyle
} from '@chakra-ui/react';

const theme = extendTheme(
  {
    styles: {
      global: {
        'html, body, #root': {
          height: '100%'
        }
      }
    },
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
      },
      Link: {
        variants: {
          button: defineStyle({
            backgroundColor: 'blue.500',
            color: 'white',
            height: 10,
            padding: '0 12px',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 'var(--chakra-radii-md);',
            _hover: { textDecoration: 'none', backgroundColor: 'blue.600' }
          }),
          outlineButton: defineStyle({
            borderColor: 'blue.500',
            borderWidth: 1,
            color: 'blue.500',
            height: 10,
            padding: '0 12px',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 'var(--chakra-radii-md);',
            textDecoration: 'none',
            _hover: { textDecoration: 'none', backgroundColor: 'blue.50' }
          })
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
