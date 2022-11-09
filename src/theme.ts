import {
  extendTheme,
  withDefaultColorScheme,
  defineStyle,
  theme as baseTheme
} from '@chakra-ui/react';
import { mode, GlobalStyleProps } from '@chakra-ui/theme-tools';

const colors = {
  error: 'var(--error)',
  'primary-background': 'var(--primary-background)',
  'primary-background--hover': 'var(--primary-background--hover)'
};
const theme = extendTheme(
  {
    config: { initialColorMode: 'system' },
    colors,
    styles: {
      global: (props: GlobalStyleProps) => ({
        ':root': {
          '--error': mode(
            baseTheme.colors.red['500'],
            baseTheme.colors.red['200']
          )(props),
          '--primary-background': mode(
            baseTheme.colors.gray['100'],
            baseTheme.colors.whiteAlpha['200']
          )(props),
          '--primary-background--hover': mode(
            baseTheme.colors.gray['200'],
            baseTheme.colors.whiteAlpha['300']
          )(props)
        },
        'html, body, #root': {
          height: '100%'
        }
      })
    },
    components: {
      Spinner: {
        baseStyle: { color: 'gray.300' },
        defaultProps: { size: 'md' }
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
          link: defineStyle({
            p: '0 12px',
            fontWeight: 'bold',
            h: '100%',
            display: 'flex',
            alignItems: 'center'
          }),
          button: defineStyle({
            height: 10,
            padding: '0 12px',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 'var(--chakra-radii-md);',
            backgroundColor: 'primary-background',
            _hover: {
              textDecoration: 'none',
              backgroundColor: 'primary-background--hover'
            }
          }),
          outlineButton: defineStyle({
            borderWidth: 1,
            height: 10,
            padding: '0 12px',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 'var(--chakra-radii-md);',
            textDecoration: 'none',
            _hover: {
              textDecoration: 'none',
              backgroundColor: 'primary-background'
            }
          })
        }
      }
    }
  },
  withDefaultColorScheme({
    colorScheme: 'gray'
  })
);

export default theme;
